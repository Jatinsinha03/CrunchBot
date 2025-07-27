import { NextApiRequest, NextApiResponse } from "next";
import { callBitscrunchGET } from "./utils";

export async function tradersHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;
    const { contract_address, blockchain, sort_by, time_range } = req.query as Record<string, string | string[] | undefined>;
    const allowedSortBy = ["traders","traders_change","traders_ratio","traders_ratio_change","traders_buyers","traders_buyers_change","traders_sellers","traders_sellers_change"];
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
    const data = await callBitscrunchGET("traders", query);
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}

export default tradersHandler; 