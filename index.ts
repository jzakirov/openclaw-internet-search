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

type Routing = { categories?: string; engines?: string };
let cachedGeneralRouting: Routing | null = null;

async function resolveGeneralRouting(baseUrl: string, token: string, signal: AbortSignal): Promise<Routing> {
  if (cachedGeneralRouting) return cachedGeneralRouting;

  try {
    const configUrl = new URL("/config", baseUrl);
    if (token) configUrl.searchParams.set("token", token);
    const res = await fetch(configUrl.toString(), { signal });
    if (!res.ok) return {};

    const cfg: any = await res.json();
    const engines = Array.isArray(cfg?.engines) ? cfg.engines : [];
    const enabled = engines.filter((e: any) => e?.enabled === true);
    const generalEnabled = enabled.filter((e: any) => Array.isArray(e?.categories) && e.categories.includes("general")).length;
    const webEnabled = enabled.filter((e: any) => Array.isArray(e?.categories) && e.categories.includes("web")).length;

    cachedGeneralRouting = generalEnabled > 0 ? {} : (webEnabled > 0 ? { categories: "web" } : {});
    return cachedGeneralRouting;
  } catch {
    return {};
  }
}

async function runSearch(baseUrl: string, token: string, q: string, routing: Routing, signal: AbortSignal) {
  const url = new URL("/search", baseUrl);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  if (token) url.searchParams.set("token", token);
  if (routing.categories) url.searchParams.set("categories", routing.categories);
  if (routing.engines) url.searchParams.set("engines", routing.engines);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`SearXNG HTTP ${res.status}`);
  return res.json();
}

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
      const baseUrl = String(api.pluginConfig?.searxngUrl ?? "").trim();
      if (!baseUrl) {
        throw new Error("searxngUrl is required in the internet-search plugin config");
      }
      const token = String(api.pluginConfig?.searxngToken ?? "").trim();

      const q = String(params.query ?? "").trim();
      const count = Math.min(10, Math.max(1, Number(params.count ?? 5)));
      const category = String(params.category ?? "general").trim();
      const routing = category === "general"
        ? await resolveGeneralRouting(baseUrl, token, signal)
        : (CATEGORY_ROUTING[category] ?? {});

      const data: any = await runSearch(baseUrl, token, q, routing, signal);
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
