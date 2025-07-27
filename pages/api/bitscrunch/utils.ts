export async function callBitscrunchGET(endpoint: string, query: Record<string, string | string[]>) {
    const baseUrl = `https://api.unleashnfts.com/api/v2/nft/collection/${endpoint}`;
    const url = new URL(baseUrl);
  
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });
  
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.BITSCRUNCH_API_KEY!,
      },
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
  
    return res.json();
  }
  