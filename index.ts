// internet-search plugin: SearXNG-backed search tool

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Maps category → SearXNG query params.
// "general" uses all configured engines (no override).
// Others route to specialist engines for better signal.
const CATEGORY_ROUTING: Record<string, { categories?: string; engines?: string }> = {
  general:  {},
  news:     { categories: "news" },
  academic: { engines: "arxiv,google scholar,pubmed" },
  social:   { engines: "reddit" },
};

export default function (api: any) {
  api.registerTool({
    name: "internet_search",
    description:
      "Search the web using a SearXNG instance. Use this to gather news and learn new information. " +
      "Use category='news' for recent events, 'academic' for research papers, 'social' for opinions/discussions.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string" },
        count: { type: "number", minimum: 1, maximum: 20, default: 5 },
        category: {
          type: "string",
          enum: ["general", "news", "academic", "social"],
          default: "general",
          description:
            "general=broad web search (default); news=recent news & events; " +
            "academic=arxiv/Scholar/PubMed; social=Reddit discussions"
        }
      },
      required: ["query"]
    },
    async execute(_id: string, params: any, signal: AbortSignal) {
      const baseUrl = String(api.config?.searxngUrl ?? "").trim();
      if (!baseUrl) {
        throw new Error("searxngUrl is required in the internet-search plugin config");
      }
      const token = String(api.config?.searxngToken ?? "").trim();

      const q = String(params.query ?? "").trim();
      const count = Math.min(10, Math.max(1, Number(params.count ?? 5)));
      const category = String(params.category ?? "general").trim();
      const routing = CATEGORY_ROUTING[category] ?? {};

      const url = new URL("/search", baseUrl);
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      if (token) url.searchParams.set("token", token);
      if (routing.categories) url.searchParams.set("categories", routing.categories);
      if (routing.engines)    url.searchParams.set("engines", routing.engines);

      const res = await fetch(url.toString(), { signal });
      if (!res.ok) throw new Error(`SearXNG HTTP ${res.status}`);

      const data: any = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const mapped = results.slice(0, count).map((r: any) => ({
        title: String(r?.title ?? "").trim(),
        url: String(r?.url ?? "").trim(),
        snippet: stripHtml(String(r?.content ?? r?.snippet ?? ""))
      }));

      return {
        content: [
          { type: "text", text: JSON.stringify({ results: mapped }, null, 2) }
        ]
      };
    }
  });
}
