# openclaw-internet-search

Web search for [OpenClaw](https://openclaw.dev) agents, backed by a self-hosted [SearXNG](https://searxng.github.io/searxng/) instance.

Registers a single `internet-search` tool with category routing for general, news, academic, and social results.

## Installation

```bash
openclaw plugins install openclaw-internet-search
```

Or from a local path (development):

```bash
openclaw plugins install --path ./openclaw-internet-search
```

## Configuration

```json
{
  "searxngUrl": "https://search.example.com/",
  "searxngToken": "optional-bearer-token"
}
```

| Field         | Required | Description                                    |
|---------------|----------|------------------------------------------------|
| `searxngUrl`  | Yes      | Base URL of your SearXNG instance              |
| `searxngToken`| No       | Token for SearXNG instances that require auth  |

## Tool: `internet-search`

```
internet-search(query, count?, category?)
```

| Parameter  | Type   | Default   | Description                                          |
|------------|--------|-----------|------------------------------------------------------|
| `query`    | string | —         | Search query                                         |
| `count`    | number | 5         | Number of results to return (1–20, capped at 10)     |
| `category` | string | `general` | Routing category (see below)                         |

### Categories

| Value      | Routes to                              |
|------------|----------------------------------------|
| `general`  | All configured SearXNG engines         |
| `news`     | SearXNG news category                  |
| `academic` | arXiv, Google Scholar, PubMed          |
| `social`   | Reddit                                 |

### Response

Returns a JSON array of results:

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
- A running SearXNG instance with JSON format enabled

## License

MIT
