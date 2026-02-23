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

To use this plugin as the sole web search (disabling the default Brave/Perplexity `web_search` tool):

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
    "slots": {
      "web-search": "internet-search"   // claim the web-search slot
    },
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

With the slot claimed, OpenClaw ensures no other `web-search` plugin can load simultaneously. If you only want to add search alongside the built-in tool (rather than replace it), skip `tools.web.search.enabled: false` and omit `slots`.

## Tool: `internet-search`

```
internet-search(query, count?, category?)
```

| Parameter  | Type   | Default   | Description                                      |
|------------|--------|-----------|--------------------------------------------------|
| `query`    | string | —         | Search query                                     |
| `count`    | number | 5         | Number of results to return (1–20, capped at 10) |
| `category` | string | `general` | Routing category (see below)                     |

### Categories

| Value      | Routes to                      |
|------------|--------------------------------|
| `general`  | All configured SearXNG engines |
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

## Publishing to npm

```bash
npm login                 # log in to your npm account
npm publish               # publishes as openclaw-internet-search
```

Once published, anyone can install it with:

```bash
openclaw plugins install openclaw-internet-search
```

For a scoped package (e.g. `@yourorg/openclaw-internet-search`), update `name` in `package.json` before publishing. OpenClaw normalizes scoped names to the unscoped id for `plugins.entries.*`.

## Listing on ClaWHub

[ClaWHub](https://clawhub.dev) is the public skill registry for OpenClaw. To list the bundled `SKILL.md`:

```bash
npm install -g clawhub-cli        # install the CLI
clawhub publish . \
  --slug internet-search \
  --name "Internet Search" \
  --version 0.1.0 \
  --tags "search,web,searxng"
```

The registry indexes it immediately and makes it discoverable via vector search.

## Listing as a community plugin

Open a pull request to [openclaw docs](https://docs.openclaw.ai) adding an entry to the community plugins page:

```
**Internet Search** — SearXNG-backed web search with category routing.
npm: `openclaw-internet-search`
repo: `https://github.com/jzakirov/openclaw-internet-search`
install: `openclaw plugins install openclaw-internet-search`
```

## License

MIT
