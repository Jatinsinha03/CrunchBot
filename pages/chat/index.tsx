import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Title);

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{
    query: string;
    summary: string;
    data: unknown;
    time: string;
    graph?: { x: string[] | number[]; x_label: string; y: string[] | number[]; y_label: string } | null;
  }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userQuery = input.trim();
    setInput("");
    const now = formatTime(new Date());
    setMessages((prev) => [...prev, { query: userQuery, summary: "", data: null, time: now }]);
    try {
      const res = await fetch("/api/bitscrunch/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      const result = await res.json();
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          summary: result.summary,
          data: result.data,
          graph: result.graph,
        };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          summary: "Sorry, something went wrong.",
          data: null,
          graph: null,
        };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  // Explicitly type the props for ReactMarkdown custom components
  const markdownComponents: Components = {
    h1: (props) => <h1 className="text-lg font-bold mt-2 mb-1 text-indigo-200" {...props} />,
    h2: (props) => <h2 className="text-base font-semibold mt-2 mb-1 text-indigo-200" {...props} />,
    h3: (props) => <h3 className="text-sm font-semibold mt-2 mb-1 text-indigo-200" {...props} />,
    ul: (props) => <ul className="list-disc ml-6 my-2" {...props} />,
    ol: (props) => <ol className="list-decimal ml-6 my-2" {...props} />,
    li: (props) => <li className="mb-1" {...props} />,
    strong: (props) => <strong className="font-bold text-indigo-100" {...props} />,
    em: (props) => <em className="italic text-indigo-200" {...props} />,
    code: (props) => <code className="bg-black/40 px-1 rounded text-xs text-indigo-300" {...props} />,
    pre: (props) => <pre className="bg-black/40 p-2 rounded text-xs text-indigo-200 overflow-x-auto my-2" {...props} />,
    p: (props) => <p className="mb-2 text-base" {...props} />,
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center px-0 py-0">
      <h1 className="text-3xl font-bold text-center text-white mb-10 mt-12 tracking-tight">NFT Analytics Chat</h1>
      <div className="flex-1 w-full flex flex-col justify-end">
        <div className="flex-1 w-full overflow-y-auto space-y-8 px-0 pb-40" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {messages.length === 0 && !loading && (
            <div className="text-center text-gray-400 mt-24 text-xl">Ask anything about an NFT collection...</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              {/* User message (right) */}
              <div className="flex justify-end">
                <div className="flex items-end gap-3 max-w-[60vw]">
                  <div className="bg-indigo-500 text-white rounded-2xl px-6 py-4 shadow font-medium text-base text-right">
                    <div className="flex items-center gap-3">
                      <span>{msg.query}</span>
                      <span className="text-xs text-gray-200 ml-2">{msg.time}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow ml-1">
                    <span role="img" aria-label="User">🧑</span>
                  </div>
                </div>
              </div>
              {/* Bot response (left) */}
              {msg.summary && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-3 max-w-[70vw]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-indigo-900 font-bold text-lg shadow mr-1">
                      <span role="img" aria-label="Bot">🤖</span>
                    </div>
                    <div className="bg-white/10 border border-indigo-400/30 text-indigo-100 rounded-2xl px-6 py-4 shadow text-base">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="font-semibold text-indigo-300 text-base">Summary:</span>
                        <span className="text-xs text-gray-400">{msg.time}</span>
                      </div>
                      <span className="whitespace-pre-line">
                        <ReactMarkdown components={markdownComponents}>
                          {msg.summary}
                        </ReactMarkdown>
                      </span>
                      {/* Render line chart if graph is present */}
                      {msg.graph && msg.graph.x && msg.graph.y && Array.isArray(msg.graph.x) && Array.isArray(msg.graph.y) && (
                        <div className="mt-6 mb-2">
                          <Line
                            data={{
                              labels: msg.graph.x as string[],
                              datasets: [
                                {
                                  label: msg.graph.y_label || "Y",
                                  data: msg.graph.y,
                                  borderColor: "#6366f1",
                                  backgroundColor: "rgba(99,102,241,0.1)",
                                  tension: 0.3,
                                  pointRadius: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: { display: true, labels: { color: "#a5b4fc", font: { size: 12 } } },
                                title: { display: true, text: msg.graph.x_label + " vs " + msg.graph.y_label, color: "#818cf8", font: { size: 16, weight: "bold" } },
                              },
                              scales: {
                                x: {
                                  title: { display: true, text: msg.graph.x_label, color: "#a5b4fc", font: { size: 14 } },
                                  ticks: { color: "#c7d2fe", font: { size: 11 } },
                                },
                                y: {
                                  title: { display: true, text: msg.graph.y_label, color: "#a5b4fc", font: { size: 14 } },
                                  ticks: { color: "#c7d2fe", font: { size: 11 } },
                                },
                              },
                            }}
                            height={220}
                          />
                        </div>
                      )}
                      {(typeof msg.data === 'object' && msg.data !== null) || typeof msg.data === 'string' ? (
                        <details className="mt-4 text-xs text-gray-400 bg-black/30 rounded p-3">
                          <summary className="cursor-pointer text-gray-300 text-sm">Raw Data</summary>
                          {typeof msg.data === 'object' ? (
                            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(msg.data, null, 2)}</pre>
                          ) : (
                            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{msg.data}</pre>
                          )}
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4">
                <span className="block w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              </div>
              <div className="text-indigo-200 text-lg font-medium">Thinking...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 w-full flex items-center gap-4 bg-gray-900/90 px-12 py-8 z-10">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 rounded-xl px-7 py-5 bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-base"
            placeholder="Type your NFT analytics question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-10 py-5 rounded-xl shadow transition text-base disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
      <style jsx global>{`
        body { background: transparent !important; }
      `}</style>
    </div>
  );
} 