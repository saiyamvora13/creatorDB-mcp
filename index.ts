#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = "https://apiv3.creatordb.app";
const API_KEY = process.env.CREATORDB_API_KEY;

if (!API_KEY) {
  console.error("Error: CREATORDB_API_KEY environment variable is required");
  process.exit(1);
}

// =============================================================================
// Types
// =============================================================================

interface SearchFilter {
  filterName: string;
  op: "in" | ">" | "=" | "<";
  value: string | number | string[] | boolean;
  isFuzzySearch?: boolean;
}

interface SearchRequest {
  filters: SearchFilter[];
  pageSize: number;
  offset: number;
  sortBy?: string;
  desc?: boolean;
}

// =============================================================================
// API Client
// =============================================================================

async function makeApiRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY!,
    },
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(
      data.errorDescription || data.message || `API Error: ${response.status}`
    );
  }

  return data as T;
}

// =============================================================================
// Tool Definitions - Based on CreatorDB OpenAPI V3 Spec
// =============================================================================

const tools: Tool[] = [
  // =========================================================================
  // General Operations
  // =========================================================================
  {
    name: "get_api_usage",
    description:
      "Get API usage statistics for the authenticated user within a specified date range (max 365 days). Returns request counts and quota usage per endpoint and platform.",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description:
            "Start unix timestamp in milliseconds. Defaults to 7 days ago if not provided.",
        },
        end: {
          type: "string",
          description:
            "End unix timestamp in milliseconds. Defaults to current time if not provided.",
        },
      },
    },
  },

  // =========================================================================
  // Instagram Endpoints
  // =========================================================================
  {
    name: "instagram_get_profile",
    description:
      "Get complete Instagram creator profile including metadata, statistics, hashtags, niches, and content analysis.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description:
            "Instagram account ID (e.g., 'instagram' or '@instagram'). The @ symbol will be automatically removed.",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_get_contact",
    description: "Retrieve contact information (emails) for an Instagram creator.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description: "Instagram account ID (e.g., 'instagram' or '@instagram').",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_get_content_detail",
    description:
      "Get detailed information about specific Instagram content by content ID.",
    inputSchema: {
      type: "object",
      properties: {
        contentId: {
          type: "string",
          description: "The Instagram content ID.",
        },
      },
      required: ["contentId"],
    },
  },
  {
    name: "instagram_get_performance",
    description:
      "Get advanced performance metrics including post activity, follower growth, engagement rates, likes, comments, and consistency scores.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description: "Instagram account ID (e.g., 'instagram' or '@instagram').",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_get_performance_history",
    description:
      "Get historical performance data for an Instagram creator over time.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description: "Instagram account ID.",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_get_sponsorship",
    description:
      "Get sponsorship/branded content information for an Instagram creator.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description: "Instagram account ID.",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_get_audience",
    description:
      "Get audience demographic insights including country distribution, gender breakdown, age composition, and average age.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description: "Instagram account ID.",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "instagram_search",
    description:
      "Search for Instagram creators using advanced filters. Supports filtering by displayName, follower count, engagement rate, country, language, niches, and more. Max 10 filters per request.",
    inputSchema: {
      type: "object",
      properties: {
        filters: {
          type: "array",
          description:
            "Array of filter objects. Each filter has: filterName (field to filter), op ('in', '>', '=', '<'), value (string/number/array/boolean), isFuzzySearch (optional, for string fields).",
          items: {
            type: "object",
            properties: {
              filterName: {
                type: "string",
                description:
                  "Field to filter on (e.g., 'displayName', 'totalFollowers', 'country', 'mainLanguage', 'niches', 'avgEngagementRate', 'isVerified').",
              },
              op: {
                type: "string",
                enum: ["in", ">", "=", "<"],
                description: "Comparison operator.",
              },
              value: {
                description:
                  "Filter value. Use string/string[] for text fields, number for numeric fields, boolean for boolean fields.",
              },
              isFuzzySearch: {
                type: "boolean",
                description: "Enable fuzzy matching for string fields.",
                default: false,
              },
            },
            required: ["filterName", "op", "value"],
          },
        },
        pageSize: {
          type: "integer",
          description: "Results per page (1-100).",
          minimum: 1,
          maximum: 100,
          default: 20,
        },
        offset: {
          type: "integer",
          description: "Number of records to skip for pagination.",
          minimum: 0,
          default: 0,
        },
        sortBy: {
          type: "string",
          description:
            "Field to sort by (e.g., 'totalFollowers', 'avgEngagementRate', 'displayName').",
        },
        desc: {
          type: "boolean",
          description: "Sort in descending order.",
          default: true,
        },
      },
      required: ["filters", "pageSize", "offset"],
    },
  },
  {
    name: "instagram_natural_language_search",
    description:
      "Search Instagram creators using natural language. AI converts your plain text query into structured filters.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Natural language search query (e.g., 'fashion influencers in USA with over 100k followers').",
        },
        pageSize: {
          type: "integer",
          description: "Results per page (1-100).",
          default: 20,
        },
        offset: {
          type: "integer",
          description: "Pagination offset.",
          default: 0,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "instagram_get_niches",
    description:
      "Get all available Instagram niches with their categories and creator counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // =========================================================================
  // YouTube Endpoints
  // =========================================================================
  {
    name: "youtube_get_profile",
    description:
      "Get complete YouTube creator profile including metadata, subscriber count, categories, hashtags, topics, niches, pricing estimates, and related creators.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: {
          type: "string",
          description:
            "YouTube channel ID (format: UC followed by 22 characters, e.g., 'UCBR8-60-B28hp2BmDPdntcQ').",
        },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_search",
    description:
      "Search for YouTube creators using advanced filters including subscriber count, engagement, country, language, topics, and niches.",
    inputSchema: {
      type: "object",
      properties: {
        filters: {
          type: "array",
          description: "Array of filter objects (same structure as Instagram search).",
          items: {
            type: "object",
            properties: {
              filterName: {
                type: "string",
                description:
                  "Field to filter (e.g., 'displayName', 'totalSubscribers', 'country', 'topics', 'niches').",
              },
              op: { type: "string", enum: ["in", ">", "=", "<"] },
              value: { description: "Filter value." },
              isFuzzySearch: { type: "boolean", default: false },
            },
            required: ["filterName", "op", "value"],
          },
        },
        pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        offset: { type: "integer", minimum: 0, default: 0 },
        sortBy: { type: "string" },
        desc: { type: "boolean", default: true },
      },
      required: ["filters", "pageSize", "offset"],
    },
  },
  {
    name: "youtube_get_performance",
    description:
      "Get YouTube creator performance metrics including view counts, engagement rates, and content statistics.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "YouTube channel ID." },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_get_performance_history",
    description: "Get historical performance data for a YouTube creator.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "YouTube channel ID." },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_get_content_detail",
    description: "Get detailed information about a specific YouTube video.",
    inputSchema: {
      type: "object",
      properties: {
        contentId: { type: "string", description: "YouTube video ID." },
      },
      required: ["contentId"],
    },
  },
  {
    name: "youtube_get_sponsorship",
    description: "Get sponsorship/branded content data for a YouTube creator.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "YouTube channel ID." },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_get_contact",
    description: "Get contact information for a YouTube creator.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "YouTube channel ID." },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_get_audience",
    description:
      "Get audience demographic insights for a YouTube creator including location, gender, and age breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "YouTube channel ID." },
      },
      required: ["channelId"],
    },
  },
  {
    name: "youtube_natural_language_search",
    description: "Search YouTube creators using natural language queries.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language search query." },
        pageSize: { type: "integer", default: 20 },
        offset: { type: "integer", default: 0 },
      },
      required: ["query"],
    },
  },
  {
    name: "youtube_get_topics",
    description:
      "Get all available YouTube topics (content categories) with creator counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "youtube_get_niches",
    description: "Get all available YouTube niches with categories and creator counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // =========================================================================
  // TikTok Endpoints
  // =========================================================================
  {
    name: "tiktok_get_profile",
    description:
      "Get complete TikTok creator profile including metadata, follower stats, hashtags, niches, and content analysis.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: {
          type: "string",
          description:
            "TikTok account ID (e.g., 'tiktok' or '@tiktok'). The @ symbol will be automatically removed.",
        },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "tiktok_search",
    description:
      "Search for TikTok creators using advanced filters including follower count, engagement, country, language, and niches.",
    inputSchema: {
      type: "object",
      properties: {
        filters: {
          type: "array",
          description: "Array of filter objects.",
          items: {
            type: "object",
            properties: {
              filterName: {
                type: "string",
                description:
                  "Field to filter (e.g., 'displayName', 'totalFollowers', 'country', 'niches').",
              },
              op: { type: "string", enum: ["in", ">", "=", "<"] },
              value: { description: "Filter value." },
              isFuzzySearch: { type: "boolean", default: false },
            },
            required: ["filterName", "op", "value"],
          },
        },
        pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        offset: { type: "integer", minimum: 0, default: 0 },
        sortBy: { type: "string" },
        desc: { type: "boolean", default: true },
      },
      required: ["filters", "pageSize", "offset"],
    },
  },
  {
    name: "tiktok_get_contact",
    description: "Get contact information for a TikTok creator.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: { type: "string", description: "TikTok account ID." },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "tiktok_get_performance",
    description:
      "Get TikTok creator performance metrics including view counts, engagement rates, and content statistics.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: { type: "string", description: "TikTok account ID." },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "tiktok_get_performance_history",
    description: "Get historical performance data for a TikTok creator.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: { type: "string", description: "TikTok account ID." },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "tiktok_get_content_detail",
    description: "Get detailed information about a specific TikTok video.",
    inputSchema: {
      type: "object",
      properties: {
        contentId: { type: "string", description: "TikTok content ID." },
      },
      required: ["contentId"],
    },
  },
  {
    name: "tiktok_get_audience",
    description:
      "Get audience demographic insights for a TikTok creator including location, gender, and age breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        uniqueId: { type: "string", description: "TikTok account ID." },
      },
      required: ["uniqueId"],
    },
  },
  {
    name: "tiktok_natural_language_search",
    description: "Search TikTok creators using natural language queries.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language search query." },
        pageSize: { type: "integer", default: 20 },
        offset: { type: "integer", default: 0 },
      },
      required: ["query"],
    },
  },
  {
    name: "tiktok_get_niches",
    description: "Get all available TikTok niches with categories and creator counts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// =============================================================================
// Tool Handlers
// =============================================================================

async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    let result: unknown;

    switch (name) {
      // =======================================================================
      // General Operations
      // =======================================================================
      case "get_api_usage": {
        const params = new URLSearchParams();
        if (args.start) params.append("start", String(args.start));
        if (args.end) params.append("end", String(args.end));
        const queryString = params.toString();
        result = await makeApiRequest(`/usage${queryString ? `?${queryString}` : ""}`);
        break;
      }

      // =======================================================================
      // Instagram
      // =======================================================================
      case "instagram_get_profile": {
        result = await makeApiRequest(`/instagram/profile?uniqueId=${args.uniqueId}`);
        break;
      }
      case "instagram_get_contact": {
        result = await makeApiRequest(`/instagram/contact?uniqueId=${args.uniqueId}`);
        break;
      }
      case "instagram_get_content_detail": {
        result = await makeApiRequest(
          `/instagram/content-detail?contentId=${args.contentId}`
        );
        break;
      }
      case "instagram_get_performance": {
        result = await makeApiRequest(
          `/instagram/performance?uniqueId=${args.uniqueId}`
        );
        break;
      }
      case "instagram_get_performance_history": {
        result = await makeApiRequest(
          `/instagram/performance-history?uniqueId=${args.uniqueId}`
        );
        break;
      }
      case "instagram_get_sponsorship": {
        result = await makeApiRequest(
          `/instagram/sponsorship?uniqueId=${args.uniqueId}`
        );
        break;
      }
      case "instagram_get_audience": {
        result = await makeApiRequest(`/instagram/audience?uniqueId=${args.uniqueId}`);
        break;
      }
      case "instagram_search": {
        const searchBody: SearchRequest = {
          filters: args.filters as SearchFilter[],
          pageSize: (args.pageSize as number) || 20,
          offset: (args.offset as number) || 0,
        };
        if (args.sortBy) searchBody.sortBy = args.sortBy as string;
        if (args.desc !== undefined) searchBody.desc = args.desc as boolean;
        result = await makeApiRequest("/instagram/search", "POST", searchBody);
        break;
      }
      case "instagram_natural_language_search": {
        result = await makeApiRequest("/instagram/nls", "POST", {
          query: args.query,
          pageSize: args.pageSize || 20,
          offset: args.offset || 0,
        });
        break;
      }
      case "instagram_get_niches": {
        result = await makeApiRequest("/instagram/niches");
        break;
      }

      // =======================================================================
      // YouTube
      // =======================================================================
      case "youtube_get_profile": {
        result = await makeApiRequest(`/youtube/profile?channelId=${args.channelId}`);
        break;
      }
      case "youtube_search": {
        const ytSearchBody: SearchRequest = {
          filters: args.filters as SearchFilter[],
          pageSize: (args.pageSize as number) || 20,
          offset: (args.offset as number) || 0,
        };
        if (args.sortBy) ytSearchBody.sortBy = args.sortBy as string;
        if (args.desc !== undefined) ytSearchBody.desc = args.desc as boolean;
        result = await makeApiRequest("/youtube/search", "POST", ytSearchBody);
        break;
      }
      case "youtube_get_performance": {
        result = await makeApiRequest(`/youtube/performance?channelId=${args.channelId}`);
        break;
      }
      case "youtube_get_performance_history": {
        result = await makeApiRequest(
          `/youtube/performance-history?channelId=${args.channelId}`
        );
        break;
      }
      case "youtube_get_content_detail": {
        result = await makeApiRequest(
          `/youtube/content-detail?contentId=${args.contentId}`
        );
        break;
      }
      case "youtube_get_sponsorship": {
        result = await makeApiRequest(
          `/youtube/sponsorship?channelId=${args.channelId}`
        );
        break;
      }
      case "youtube_get_contact": {
        result = await makeApiRequest(`/youtube/contact?channelId=${args.channelId}`);
        break;
      }
      case "youtube_get_audience": {
        result = await makeApiRequest(`/youtube/audience?channelId=${args.channelId}`);
        break;
      }
      case "youtube_natural_language_search": {
        result = await makeApiRequest("/youtube/nls", "POST", {
          query: args.query,
          pageSize: args.pageSize || 20,
          offset: args.offset || 0,
        });
        break;
      }
      case "youtube_get_topics": {
        result = await makeApiRequest("/youtube/topics");
        break;
      }
      case "youtube_get_niches": {
        result = await makeApiRequest("/youtube/niches");
        break;
      }

      // =======================================================================
      // TikTok
      // =======================================================================
      case "tiktok_get_profile": {
        result = await makeApiRequest(`/tiktok/profile?uniqueId=${args.uniqueId}`);
        break;
      }
      case "tiktok_search": {
        const ttSearchBody: SearchRequest = {
          filters: args.filters as SearchFilter[],
          pageSize: (args.pageSize as number) || 20,
          offset: (args.offset as number) || 0,
        };
        if (args.sortBy) ttSearchBody.sortBy = args.sortBy as string;
        if (args.desc !== undefined) ttSearchBody.desc = args.desc as boolean;
        result = await makeApiRequest("/tiktok/search", "POST", ttSearchBody);
        break;
      }
      case "tiktok_get_contact": {
        result = await makeApiRequest(`/tiktok/contact?uniqueId=${args.uniqueId}`);
        break;
      }
      case "tiktok_get_performance": {
        result = await makeApiRequest(`/tiktok/performance?uniqueId=${args.uniqueId}`);
        break;
      }
      case "tiktok_get_performance_history": {
        result = await makeApiRequest(
          `/tiktok/performance-history?uniqueId=${args.uniqueId}`
        );
        break;
      }
      case "tiktok_get_content_detail": {
        result = await makeApiRequest(
          `/tiktok/content-detail?contentId=${args.contentId}`
        );
        break;
      }
      case "tiktok_get_audience": {
        result = await makeApiRequest(`/tiktok/audience?uniqueId=${args.uniqueId}`);
        break;
      }
      case "tiktok_natural_language_search": {
        result = await makeApiRequest("/tiktok/nls", "POST", {
          query: args.query,
          pageSize: args.pageSize || 20,
          offset: args.offset || 0,
        });
        break;
      }
      case "tiktok_get_niches": {
        result = await makeApiRequest("/tiktok/niches");
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// =============================================================================
// MCP Server Setup
// =============================================================================

const server = new Server(
  {
    name: "creatordb-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleToolCall(name, (args as Record<string, unknown>) || {});

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
});

// =============================================================================
// Main Entry Point
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CreatorDB MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
