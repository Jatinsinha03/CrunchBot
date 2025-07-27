import { NextApiRequest, NextApiResponse } from "next";
import { callBitscrunchGET } from "./utils";

export async function whalesHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;
    const { contract_address, time_range, limit, sort_by, offset, sort_order, blockchain } = req.query as Record<string, string | string[] | undefined>;
    const allowedSortBy = ["nft_count","mint_count","mint_volume","mint_whales","unique_wallets","unique_mint_wallets","unique_buy_wallets","unique_sell_wallets","total_mint_volume","total_sale_volume","buy_count","buy_volume","buy_whales","sell_count","sell_volume","sell_whales","whale_holders"];
    const sortByValue = getString(sort_by);
    const query: Record<string, string> = {
      blockchain: getString(blockchain) || "ethereum",
      contract_address: getString(contract_address) || "",
      time_range: getString(time_range) || "",
      offset: getString(offset) || "0",
      limit: getString(limit) || "30",
      sort_order: getString(sort_order) || "desc",
    };
    if (sortByValue && allowedSortBy.includes(sortByValue)) {
      query.sort_by = sortByValue;
    }
    // Remove empty values
    Object.keys(query).forEach((k) => (query[k] === undefined || query[k] === "") && delete query[k]);
    const data = await callBitscrunchGET("whales", query);
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}

export default whalesHandler;
