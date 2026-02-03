# CreatorDB MCP Server

## Overview

This project is an MCP (Model Context Protocol) server that provides access to the CreatorDB Headless API V3 for influencer marketing data. It exposes 31 tools covering Instagram, YouTube, and TikTok platforms, enabling AI agents to search creators, retrieve profiles, get performance metrics, audience demographics, and contact information.

The server operates in two modes:
1. **MCP Server Mode** (`index.ts`) - Uses stdio transport for Model Context Protocol communication
2. **HTTP REST API Mode** (`server.ts`) - Express-based REST API proxy to CreatorDB

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Design Pattern
- **Proxy Architecture**: Both entry points act as authenticated proxies to the CreatorDB API V3, handling API key authentication and request formatting
- **TypeScript with ES Modules**: Modern Node.js setup using ES2022 target with NodeNext module resolution

### Entry Points
| File | Purpose | Transport |
|------|---------|-----------|
| `index.ts` | MCP server for AI agent integration | stdio |
| `server.ts` | REST API for HTTP clients | Express/HTTP |

### API Client Pattern
Both files implement a `makeApiRequest<T>()` generic function that:
- Constructs requests to `https://apiv3.creatordb.app`
- Attaches the `CREATORDB_API_KEY` from environment variables
- Handles GET and POST methods with JSON body support

### Search Filter System
The search functionality uses a structured filter system:
```typescript
interface SearchFilter {
  filterName: string;
  op: "in" | ">" | "=" | "<";
  value: string | number | string[] | boolean;
  isFuzzySearch?: boolean;
}
```

### Build Configuration
- Source files expected in `src/` directory
- Compiled output goes to `dist/`
- TypeScript strict mode enabled
- Generates declaration files and source maps

## External Dependencies

### Required Environment Variables
| Variable | Purpose |
|----------|---------|
| `CREATORDB_API_KEY` | Authentication key for CreatorDB API V3 (required) |

### External APIs
- **CreatorDB API V3** (`https://apiv3.creatordb.app`) - Primary data source for all influencer marketing data

### Key NPM Dependencies
| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server implementation and transport |
| `express` | HTTP REST API server |
| `cors` | Cross-origin request handling for REST API |
| `tsx` | TypeScript execution for development |

### Platform Support
- Node.js >= 18.0.0 required
- Exposes binary as `creatordb-mcp` when installed globally

## ChatGPT Custom GPT Integration

The HTTP REST API mode (`server.ts`) is designed for use with ChatGPT Custom GPTs:

### Setup Steps
1. Deploy this Replit project (publish it to get a stable URL)
2. Download the OpenAPI spec from `/openapi.json`
3. In ChatGPT, create a new Custom GPT
4. Go to "Configure" > "Actions" > "Import from URL"
5. Paste your deployed URL + `/openapi.json`
6. Update the server URL in the spec to match your deployed domain

### Available Endpoints
- `/api/instagram/*` - Instagram creator data (profile, contact, performance, audience, search)
- `/api/youtube/*` - YouTube creator data (profile, topics, niches, performance, audience, search)  
- `/api/tiktok/*` - TikTok creator data (profile, performance, audience, search)
- `/api/usage` - API usage statistics

### API Features
- Natural language search support (`/api/{platform}/natural-language-search`)
- Advanced filtering with structured search
- Proper error handling with upstream status codes
- ID sanitization (handles @usernames automatically)