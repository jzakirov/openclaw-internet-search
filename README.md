# internet-search

Web search for [OpenClaw](https://openclaw.dev) agents, backed by a self-hosted [SearXNG](https://searxng.github.io/searxng/) instance.

Registers a single `internet_search` tool with category routing for general, news, academic, and social results.

## Installation

```bash
openclaw plugins install @jzakirov/internet-search
```

Or from a local path (development):

```bash
openclaw plugins install ./internet-search
```

## Configuration

Add to `openclaw.json` under `plugins.entries.internet-search.config`:

```json
{
  "searxngUrl": "https://search.example.com/",
  "searxngToken": "optional-bearer-token"
}
```

| Field          | Required | Description                                   |
|----------------|----------|-----------------------------------------------|
| `searxngUrl`   | Yes      | Base URL of your SearXNG instance             |
| `searxngToken` | No       | Token for SearXNG instances that require auth |

## Replacing the built-in web search

To use this plugin as the sole web search (disabling the default Brave/Perplexity `web_search` tool), set `tools.web.search.enabled` to `false`:

```json5
// openclaw.json
{
  "tools": {
    "web": {
      "search": {
        "enabled": false   // disable built-in web_search tool
      }
    }
  },
  "plugins": {
    "allow": ["internet-search"],
    "entries": {
      "internet-search": {
        "enabled": true,
        "config": {
          "searxngUrl": "https://search.example.com/",
          "searxngToken": "your-token"
        }
      }
    }
  }
}
```

If you only want to add `internet_search` alongside the built-in tool (rather than replace it), omit the `tools.web.search.enabled` change.

## Tool: `internet_search`

```
internet_search(query, count?, category?)
```

| Parameter  | Type   | Default   | Description                                      |
|------------|--------|-----------|--------------------------------------------------|
| `query`    | string | —         | Search query                                     |
| `count`    | number | 5         | Number of results to return (1–20, capped at 10) |
| `category` | string | `general` | Routing category (see below)                     |

### Categories

| Value      | Routes to                      |
|------------|--------------------------------|
| `general`  | All configured SearXNG engines (auto-detects `general` vs `web` based on `/config`) |
| `news`     | SearXNG news category          |
| `academic` | arXiv, Google Scholar, PubMed  |
| `social`   | Reddit                         |

### Response

```json
{
  "results": [
    {
      "title": "Example result",
      "url": "https://example.com/article",
      "snippet": "A short excerpt from the page..."
    }
  ]
}
```

HTML tags are stripped from snippets automatically.

## Requirements

- OpenClaw ≥ 2025.0.0
- A running SearXNG instance with JSON format enabled (`search.formats: [json]` in SearXNG config)

## License

MIT
