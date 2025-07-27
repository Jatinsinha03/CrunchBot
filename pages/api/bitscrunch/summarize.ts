import { NextApiRequest, NextApiResponse } from "next";
import { callGemini } from "@/lib/gemini";
import queryHandler from "./query";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, query } = req.body;
  if (!question || !query) {
    return res.status(400).json({ error: "Missing question or query field" });
  }

  // Step 1: Get the data using the existing query endpoint logic
  // We'll call the query handler in-memory
  const fakeReq = {
    ...req,
    method: "POST",
    body: { query },
  } as NextApiRequest;

  let data: unknown;
  let endpoint: string | undefined;
  let error: unknown;
  const fakeRes = {
    status: (code: number) => ({
      json: (result: unknown) => {
        if (code === 200 && typeof result === 'object' && result !== null && 'data' in result && 'source' in result) {
          endpoint = (result as { source: string }).source;
          data = (result as { data: unknown }).data;
        } else {
          error = result;
        }
      },
    }),
  } as unknown as NextApiResponse;

  await queryHandler(fakeReq, fakeRes);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch data for summarization", details: error });
  }

  // Step 2: Summarize the data using Gemini
  const systemPrompt = `You are a helpful assistant that summarizes NFT analytics data for users. Given a user question and the relevant data, provide a concise, clear, and accurate answer to the user's question based only on the data provided. If the data is insufficient, say so.`;

  const userPrompt = `User question: ${question}\n\nData: ${JSON.stringify(data, null, 2)}`;

  const geminiResponse = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (!geminiResponse) {
    return res.status(500).json({ error: "No response from Gemini API" });
  }

  return res.status(200).json({ summary: geminiResponse });
} 