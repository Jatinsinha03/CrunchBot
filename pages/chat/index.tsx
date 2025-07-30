import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Title } from "chart.js";
import { Geist } from "next/font/google";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Title);

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  time: string;
  graph?: {
    x: string[] | number[];
    x_label: string;
    y: string[] | number[];
    y_label: string;
  } | null;
}

interface ChatSession {
  _id: string;
  heading: string;
  createdAt: string;
  messageCount: number;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentChatHeading, setCurrentChatHeading] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(userData);
      setUser(user);
      setIsAuthenticated(true);
      loadSessions();
    } catch (error) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/get-chats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      // ignore
    }
  };

  const loadSessionMessages = async (sessionId: string, heading: string) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setCurrentChatHeading(heading);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/auth/get-chats?sessionId=${sessionId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateHeading = async (query: string) => {
    try {
      const response = await fetch("/api/auth/generate-heading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.heading;
      }
    } catch {
      // ignore
    }
    return "New Chat";
  };

  const saveChatMessage = async (sessionId: string | null, heading: string, message: ChatMessage) => {
    try {
      const token = localStorage.getItem("token");
      const body = sessionId
        ? { sessionId, role: message.role, content: message.content, time: message.time, graph: message.graph }
        : { heading, role: message.role, content: message.content, time: message.time, graph: message.graph };
      const response = await fetch("/api/auth/save-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {}
    return null;
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setCurrentChatHeading("");
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    const currentTime = formatTime(new Date());
    let heading = currentChatHeading;
    let sessionId = currentSessionId;
    let newMessages = [...messages];

    // If this is the first message in a new chat, generate heading and create session
    if (!sessionId) {
      heading = await generateHeading(input);
      setCurrentChatHeading(heading);
      newMessages = [];
    }

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input, time: currentTime };
    newMessages = [...newMessages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Save user message and get sessionId if new
    const sessionResponse = await saveChatMessage(sessionId, heading, userMessage);
    if (!sessionId && sessionResponse && sessionResponse.sessionId) {
      setCurrentSessionId(sessionResponse.sessionId);
      sessionId = sessionResponse.sessionId; // update for this scope
    }

    try {
      const response = await fetch("/api/bitscrunch/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");
      const botMessage: ChatMessage = {
        role: 'bot',
        content: data.summary || "",
        time: currentTime,
        graph: data.graph || null
      };
      setMessages(prev => [...prev, botMessage]);
      await saveChatMessage(sessionId, heading, botMessage);
      await loadSessions();
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        time: currentTime
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(sessionId, heading, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-xl font-bold text-indigo-200 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-semibold text-indigo-200 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-semibold text-indigo-200 mb-1">{children}</h3>,
    p: ({ children }) => <p className="mb-2 text-indigo-100">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-indigo-100">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-indigo-100">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-indigo-200">{children}</strong>,
    em: ({ children }) => <em className="italic text-indigo-200">{children}</em>,
    code: ({ children }) => <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-200 font-mono text-sm">{children}</code>,
    pre: ({ children }) => <pre className="bg-indigo-900/50 p-2 rounded text-indigo-200 font-mono text-sm overflow-x-auto mb-2">{children}</pre>,
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${geist.variable} font-sans min-h-screen bg-gray-900 text-white from-gray-900 via-indigo-900 to-purple-900 flex`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-black/30 backdrop-blur-sm border-r border-indigo-500/20 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 mb-6"
          >
            + New Chat
          </button>
          <div className="space-y-2">
            <h3 className="text-indigo-300 font-semibold mb-3">Previous Chats</h3>
            {sessions.length === 0 ? (
              <p className="text-indigo-400 text-sm">No previous chats</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => loadSessionMessages(session._id, session.heading)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-indigo-400/30 transition-all duration-200"
                >
                  <div className="font-medium text-indigo-200 text-sm mb-1">
                    {session.heading}
                  </div>
                  <div className="text-indigo-400 text-xs">
                    {formatDate(new Date(session.createdAt))} &middot; {session.messageCount} msg
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-black/20 backdrop-blur-sm border-b border-indigo-500/20 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                {/* Hamburger SVG icon (always visible) */}
                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                NFT Analytics Chat
              </span>
              {currentChatHeading && (
                <span className="text-indigo-300 text-sm ml-4">
                  {currentChatHeading}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-indigo-300 text-sm">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-indigo-200 mb-2">Welcome to NFT Analytics</h2>
                <p className="text-indigo-300 mb-6">Ask me anything about NFT collections, trading patterns, and market insights.</p>
                <div className="text-sm text-indigo-400 space-y-2">
                  <p>💡 Try: &quot;Show me BAYC sales trends&quot;</p>
                  <p>💡 Try: &quot;What&apos;s the floor price of CryptoPunks?&quot;</p>
                  <p>💡 Try: &quot;Analyze whale activity in Doodles&quot;</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                {/* User message (right) */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="flex items-end gap-3 max-w-[60vw]">
                      <div className="bg-indigo-500 text-white rounded-2xl px-6 py-4 shadow font-medium text-base text-right">
                        <div className="flex items-center gap-3">
                          <span>{msg.content}</span>
                          <span className="text-xs text-gray-200 ml-2">{msg.time}</span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow ml-1">
                        <span role="img" aria-label="User">🧑</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Bot response (left) */}
                {msg.role === 'bot' && (
                  <div className="flex justify-start">
                    <div className="flex items-end gap-3 max-w-[70vw]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-indigo-900 font-bold text-lg shadow mr-1">
                        <span role="img" aria-label="Bot">🤖</span>
                      </div>
                      <div className="bg-white/10 border border-indigo-400/30 text-indigo-100 rounded-2xl px-6 py-6 shadow text-base min-h-[600px]">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="font-semibold text-indigo-300 text-base">Summary:</span>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                        </div>
                        <span className="whitespace-pre-line">
                          <ReactMarkdown components={markdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        </span>
                        {msg.graph && msg.graph.x && msg.graph.y && Array.isArray(msg.graph.x) && Array.isArray(msg.graph.y) && (
                          <div className="mt-6 mb-2">
                            <Line 
                              data={{
                                labels: msg.graph.x.map(String),
                                datasets: [{
                                  label: msg.graph.y_label,
                                  data: msg.graph.y,
                                  borderColor: 'rgb(147, 51, 234)',
                                  backgroundColor: 'rgba(147, 51, 234, 0.2)',
                                  borderWidth: 4,
                                  tension: 0.3,
                                  pointBackgroundColor: 'rgb(147, 51, 234)',
                                  pointBorderColor: '#ffffff',
                                  pointBorderWidth: 3,
                                  pointRadius: 6,
                                  pointHoverRadius: 8,
                                  pointHoverBorderWidth: 4,
                                  fill: true,
                                }]
                              }} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    labels: {
                                      color: 'rgb(255, 255, 255)',
                                      font: {
                                        size: 14,
                                        weight: 'bold'
                                      },
                                      padding: 20
                                    }
                                  },
                                  title: {
                                    display: true,
                                    text: msg.graph.x_label,
                                    color: 'rgb(255, 255, 255)',
                                    font: {
                                      size: 16,
                                      weight: 'bold'
                                    },
                                    padding: {
                                      top: 10,
                                      bottom: 20
                                    }
                                  }
                                },
                                scales: {
                                  x: {
                                    ticks: {
                                      color: 'rgb(255, 255, 255)',
                                      font: {
                                        size: 12,
                                        weight: 'bold'
                                      },
                                      maxRotation: 45,
                                      minRotation: 45
                                    },
                                    grid: {
                                      color: 'rgba(255, 255, 255, 0.2)',
                                      lineWidth: 1
                                    },
                                    border: {
                                      color: 'rgba(255, 255, 255, 0.3)',
                                      width: 2
                                    }
                                  },
                                  y: {
                                    ticks: {
                                      color: 'rgb(255, 255, 255)',
                                      font: {
                                        size: 12,
                                        weight: 'bold'
                                      }
                                    },
                                    grid: {
                                      color: 'rgba(255, 255, 255, 0.2)',
                                      lineWidth: 1
                                    },
                                    border: {
                                      color: 'rgba(255, 255, 255, 0.3)',
                                      width: 2
                                    }
                                  }
                                },
                                interaction: {
                                  intersect: false,
                                  mode: 'index'
                                },
                                elements: {
                                  point: {
                                    hoverRadius: 8
                                  }
                                }
                              }} 
                              height={750} 
                            />
                          </div>
                        )}
                        {(typeof msg.graph === 'undefined' && ((typeof msg.content === 'object' && msg.content !== null) || typeof msg.content === 'string')) && (
                          <details className="mt-4 text-xs text-gray-400 bg-black/30 rounded p-3">
                            <summary className="cursor-pointer text-gray-300 text-sm">Raw Data</summary>
                            {typeof msg.content === 'object' ? (
                              <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(msg.content, null, 2)}</pre>
                            ) : (
                              <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{msg.content}</pre>
                            )}
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-indigo-900 font-bold text-lg shadow mr-1">
                  <span role="img" aria-label="Bot">🤖</span>
                </div>
                <div className="bg-white/10 border border-indigo-400/30 text-indigo-100 rounded-2xl px-6 py-4 shadow">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="bg-black/20 backdrop-blur-sm border-t border-indigo-500/20 p-6">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about NFT analytics, collections, trading patterns..."
              className="flex-1 px-4 py-3 bg-white/10 border border-indigo-400/30 rounded-xl text-indigo-100 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 