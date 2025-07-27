import { NextApiRequest, NextApiResponse } from "next";
import { callBitscrunchGET } from "./utils";

export async function analyticsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;
    const { contract_address, blockchain, sort_by, time_range } = req.query as Record<string, string | string[] | undefined>;
    const allowedSortBy = ["assets","assets_change","floor_price_usd","floor_price_native","sales","sales_change","volume","volume_change","transactions","transactions_change","transfers","transfers_change"];
    const sortByValue = getString(sort_by);
    const query: Record<string, string> = {
      blockchain: getString(blockchain) || "ethereum",
      contract_address: getString(contract_address) || "",
      time_range: getString(time_range) || "",
    };
    if (sortByValue && allowedSortBy.includes(sortByValue)) {
      query.sort_by = sortByValue;
    }
    // Remove empty values
    Object.keys(query).forEach((k) => (query[k] === undefined || query[k] === "") && delete query[k]);
    // Log the final API URL and query params
    const baseUrl = `https://api.unleashnfts.com/api/v2/nft/collection/analytics`;
    const url = new URL(baseUrl);
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    console.log("[analyticsHandler] Calling:", url.toString());
    console.log("[analyticsHandler] Query Params:", query);
    const data = await callBitscrunchGET("analytics", query);
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}

export default analyticsHandler; 