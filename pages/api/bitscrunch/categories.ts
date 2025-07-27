import { NextApiRequest, NextApiResponse } from "next";
import { callBitscrunchGET } from "./utils";

export async function categoriesHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;
    const { contract_address, blockchain } = req.query as Record<string, string | string[] | undefined>;
    const query: Record<string, string> = {
      blockchain: getString(blockchain) || "ethereum",
      contract_address: getString(contract_address) || "",
    };
    Object.keys(query).forEach((k) => (query[k] === undefined || query[k] === "") && delete query[k]);
    const data = await callBitscrunchGET("categories", query);
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}

export default categoriesHandler; 