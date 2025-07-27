import { NextApiRequest, NextApiResponse } from "next";
import { callGemini } from "@/lib/gemini";
import { whalesHandler } from "./whales";
import metadataHandler from "./metadata";
import ownerHandler from "./owner";
import analyticsHandler from "./analytics";
import { holdersHandler } from "./holders";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query field" });

  const systemPrompt = `
You are a smart assistant that helps route NFT-related queries to an internal API system.
You will be given a user question. Your job is to:
1. Decide which bitsCrunch API endpoint is best for the user's question. The available endpoints are:
   - whales: Collection Whales — sort_by must be one of: ["nft_count","mint_count","mint_volume","mint_whales","unique_wallets","unique_mint_wallets","unique_buy_wallets","unique_sell_wallets","total_mint_volume","total_sale_volume","buy_count","buy_volume","buy_whales","sell_count","sell_volume","sell_whales","whale_holders"]
   - washtrade: Collection Washtrade — sort_by must be one of: ["washtrade_assets","washtrade_assets_change","washtrade_suspect_sales","washtrade_suspect_sales_change","washtrade_volume","washtrade_volume_change","washtrade_wallets","washtrade_wallets_change"]
   - scores: Collection Scores — sort_by must be one of: ["marketcap","marketcap_change","price_avg","price_avg_change","price_ceiling","minting_revenue","royalty_price"]
   - metadata: Collection Metadata — sort_by is not required or used for this endpoint.
   - owner: Collection Owner — sort_by must be one of: ["acquired_date","quantity"]
   - analytics: Collection Analytics — sort_by must be one of: ["assets","assets_change","floor_price_usd","floor_price_native","sales","sales_change","volume","volume_change","transactions","transactions_change","transfers","transfers_change"]
   - traders: Collection Traders — sort_by must be one of: ["traders","traders_change","traders_ratio","traders_ratio_change","traders_buyers","traders_buyers_change","traders_sellers","traders_sellers_change"]
   - profile: Collection Profile — sort_by must be one of: ["fear_and_greed_index","washtrade_index","metadata_score","liquidity_score","market_dominance_score","token_distribution_score","collection_score","holder_metrics_score","diamond_hands","profitable_volume","loss_making_volume","profitable_trades","loss_making_trades","zero_profit_trades","profitable_trades_percentage","avg_profitable_trades","loss_making_trades_percentage","avg_loss_making_trades"]
   - categories: Collection Categories — sort_by is not required or used for this endpoint.
   - traits: Collection Traits — sort_by must be "trait_type" only.
   - holders: Collection Holders — sort_by must be one of: ["holders","holders_change"]
2. Output a JSON object containing:
  - endpoint: string (one of: whales, washtrade, scores, metadata, owner, analytics, traders, profile, categories, traits, holders)
  - queryParams: object of key-value pairs such as contract_address, blockchain, time_range, limit, sort_by, etc.

Only output valid JSON. Do not include explanations or extra formatting.
`;

  const userPrompt = `User: ${query}`;

  const geminiResponse = await callGemini([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (!geminiResponse) {
    return res.status(500).json({ error: "No response from Gemini API" });
  }

  let parsed;
  try {
    // Remove Markdown code block if present
    const cleanedGeminiResponse = geminiResponse.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
    parsed = JSON.parse(cleanedGeminiResponse);
    console.log("✅ Parsed Gemini JSON:", parsed);
  } catch (error) {
    console.error("❌ Invalid JSON from Gemini:\n", geminiResponse);
    return res.status(500).json({ error: "Invalid JSON from Gemini", raw: geminiResponse });
  }

  const endpoint = parsed?.endpoint;
  const rawParams = parsed?.queryParams ?? {};
  const queryParams = { ...rawParams };

  // 🔧 Normalize
  if (typeof queryParams.contract_address === "string") {
    queryParams.contract_address = [queryParams.contract_address];
  }
  if (typeof queryParams.limit === "string") {
    queryParams.limit = parseInt(queryParams.limit, 10);
  }

  console.log("🚀 Dispatching to endpoint:", endpoint);
  console.log("📦 Query Params:", queryParams);

  // Helper to call a handler and get the data
  async function getHandlerData(handler: unknown) {
    let data: unknown;
    let error: unknown;
    const fakeReq = {
      ...req,
      method: "GET",
      query: queryParams,
    } as NextApiRequest;
    const fakeRes = {
      status: (code: number) => ({
        json: (result: unknown) => {
          if (code === 200) {
            data = result;
          } else {
            error = result;
          }
        },
      }),
    } as unknown as NextApiResponse;
    if (typeof handler === 'function') {
      await handler(fakeReq, fakeRes);
    } else {
      throw new Error('Handler is not a function');
    }
    if (error) {
      throw error;
    }
    return data;
  }

  try {
    let data: unknown;
    if (endpoint === "whales") {
      data = await getHandlerData(whalesHandler);
    } else if (endpoint === "metadata") {
      data = await getHandlerData(metadataHandler);
    } else if (endpoint === "owner") {
      data = await getHandlerData(ownerHandler);
    } else if (endpoint === "analytics") {
      data = await getHandlerData(analyticsHandler);
    } else if (endpoint === "scores") {
      const { scoresHandler } = await import("./scores");
      data = await getHandlerData(scoresHandler);
    } else if (endpoint === "traders") {
      const { tradersHandler } = await import("./traders");
      data = await getHandlerData(tradersHandler);
    } else if (endpoint === "washtrade") {
      const { washtradeHandler } = await import("./washtrade");
      data = await getHandlerData(washtradeHandler);
    } else if (endpoint === "profile") {
      const { profileHandler } = await import("./profile");
      data = await getHandlerData(profileHandler);
    } else if (endpoint === "categories") {
      const { categoriesHandler } = await import("./categories");
      data = await getHandlerData(categoriesHandler);
    } else if (endpoint === "traits") {
      const { traitsHandler } = await import("./traits");
      data = await getHandlerData(traitsHandler);
    } else if (endpoint === "holders") {
      data = await getHandlerData(holdersHandler);
    } else {
      return res.status(400).json({ error: `Unsupported endpoint: ${endpoint}` });
    }

    // Summarize the data using Gemini
    const summaryPrompt = `
You are an expert NFT analytics explainer. Your job is to turn complex NFT analytics data into a summary that is:
- Extremely easy to understand for someone with no technical or NFT background.
- Written in plain, conversational English.
- Focused on the most important trends, changes, and what they mean for a curious user.
- Uses analogies, simple comparisons, and avoids jargon.
- Always highlight and explain the most important numbers from the data (such as sales, volume, counts, or changes), and present them in a way that's easy for the user to grasp.
- If there are patterns, spikes, or drops, explain them in a way a friend would (e.g., "There was a big jump in sales, like a sudden rush at a store sale").
- If the data is mostly flat or uneventful, say so in a friendly way.
- If the data is insufficient, say so.

Additionally, decide if a simple line chart or graph would help the user understand the data. If so, select two arrays from the data (for example, time and sales_trend), and return them as a JSON object with keys "graph": { "x": [...], "x_label": "...", "y": [...], "y_label": "..." }. If a graph is not needed, return "graph": null.

Be brief, friendly, and make the summary as clear and approachable as possible. Always output a valid JSON object with keys: "summary" (string) and "graph" (object or null).
`;
    const summaryUserPrompt = `User question: ${query}\n\nData: ${JSON.stringify(data, null, 2)}`;
    const geminiSummaryResponse = await callGemini([
      { role: "system", content: summaryPrompt },
      { role: "user", content: summaryUserPrompt },
    ]);

    let summary = "", graph = null;
    try {
      // Remove Markdown code block if present
      const cleanedSummary = geminiSummaryResponse.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
      const parsedSummary = JSON.parse(cleanedSummary);
      summary = parsedSummary.summary;
      graph = parsedSummary.graph;
    } catch (e) {
      summary = geminiSummaryResponse;
      graph = null;
    }

    return res.status(200).json({ source: endpoint, data, summary, graph });
  } catch (err) {
    console.error("❌ Query handler failed:", err);
    return res.status(500).json({ error: "Internal request failed", message: String(err) });
  }
}
