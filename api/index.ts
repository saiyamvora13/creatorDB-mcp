import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE_URL = "https://apiv3.creatordb.app";
const API_KEY = process.env.CREATORDB_API_KEY;

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

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function sanitizeId(id: string): string {
  return encodeURIComponent(id.replace(/^@/, ""));
}

async function makeApiRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  if (!API_KEY) {
    throw new ApiError("CREATORDB_API_KEY environment variable is required", 500);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    },
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.errorDescription || data.message || `API Error: ${response.status}`,
      response.status
    );
  }

  return data as T;
}

function handleError(error: unknown, res: Response) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ success: false, error: error.message });
  } else {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}

app.get("/api/usage", async (req: Request, res: Response) => {
  try {
    const params = new URLSearchParams();
    if (req.query.start) params.append("start", String(req.query.start));
    if (req.query.end) params.append("end", String(req.query.end));
    const queryString = params.toString();
    const result = await makeApiRequest(`/usage${queryString ? `?${queryString}` : ""}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/profile", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/profile?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/contact", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/contact?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/instagram/content-detail?contentId=${encodeURIComponent(String(contentId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/performance", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/performance?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/performance-history", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/performance-history?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/sponsorship", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/sponsorship?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/audience", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/audience?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/instagram/search", async (req: Request, res: Response) => {
  try {
    const { filters, pageSize = 20, offset = 0, sortBy, desc = true } = req.body;
    if (!filters) return res.status(400).json({ success: false, error: "filters is required" });
    const searchBody: SearchRequest = { filters, pageSize, offset };
    if (sortBy) searchBody.sortBy = sortBy;
    if (desc !== undefined) searchBody.desc = desc;
    const result = await makeApiRequest("/instagram/search", "POST", searchBody);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/instagram/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/instagram/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/instagram/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/instagram/niches");
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/profile", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/profile?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/youtube/search", async (req: Request, res: Response) => {
  try {
    const { filters, pageSize = 20, offset = 0, sortBy, desc = true } = req.body;
    if (!filters) return res.status(400).json({ success: false, error: "filters is required" });
    const searchBody: SearchRequest = { filters, pageSize, offset };
    if (sortBy) searchBody.sortBy = sortBy;
    if (desc !== undefined) searchBody.desc = desc;
    const result = await makeApiRequest("/youtube/search", "POST", searchBody);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/performance", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/performance?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/performance-history", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/performance-history?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/youtube/content-detail?contentId=${encodeURIComponent(String(contentId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/sponsorship", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/sponsorship?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/contact", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/contact?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/audience", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/audience?channelId=${encodeURIComponent(String(channelId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/youtube/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/youtube/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/topics", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/youtube/topics");
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/youtube/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/youtube/niches");
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/profile", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/profile?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/tiktok/search", async (req: Request, res: Response) => {
  try {
    const { filters, pageSize = 20, offset = 0, sortBy, desc = true } = req.body;
    if (!filters) return res.status(400).json({ success: false, error: "filters is required" });
    const searchBody: SearchRequest = { filters, pageSize, offset };
    if (sortBy) searchBody.sortBy = sortBy;
    if (desc !== undefined) searchBody.desc = desc;
    const result = await makeApiRequest("/tiktok/search", "POST", searchBody);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/contact", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/contact?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/performance", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/performance?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/performance-history", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/performance-history?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/tiktok/content-detail?contentId=${encodeURIComponent(String(contentId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/audience", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/audience?uniqueId=${sanitizeId(String(uniqueId))}`);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/api/tiktok/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/tiktok/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/api/tiktok/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/tiktok/niches");
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/openapi.json", (_req: Request, res: Response) => {
  const openApiSpec = {
    "openapi": "3.1.0",
    "info": {
      "title": "CreatorDB API",
      "description": "HTTP API wrapper for CreatorDB - Influencer Marketing Data across Instagram, YouTube, and TikTok",
      "version": "1.0.0"
    },
    "servers": [
      {
        "url": "https://your-app.vercel.app",
        "description": "Production server"
      }
    ],
    "paths": {
      "/api/usage": {
        "get": {
          "operationId": "getApiUsage",
          "summary": "Get API usage statistics",
          "parameters": [
            {"name": "start", "in": "query", "schema": {"type": "string"}, "description": "Start date"},
            {"name": "end", "in": "query", "schema": {"type": "string"}, "description": "End date"}
          ],
          "responses": {"200": {"description": "API usage data"}}
        }
      },
      "/api/instagram/profile": {
        "get": {
          "operationId": "getInstagramProfile",
          "summary": "Get Instagram creator profile",
          "parameters": [{"name": "uniqueId", "in": "query", "required": true, "schema": {"type": "string"}, "description": "Instagram username"}],
          "responses": {"200": {"description": "Profile data"}}
        }
      },
      "/api/instagram/contact": {
        "get": {
          "operationId": "getInstagramContact",
          "summary": "Get Instagram creator contact info",
          "parameters": [{"name": "uniqueId", "in": "query", "required": true, "schema": {"type": "string"}}],
          "responses": {"200": {"description": "Contact data"}}
        }
      },
      "/api/instagram/performance": {
        "get": {
          "operationId": "getInstagramPerformance",
          "summary": "Get Instagram creator performance metrics",
          "parameters": [{"name": "uniqueId", "in": "query", "required": true, "schema": {"type": "string"}}],
          "responses": {"200": {"description": "Performance data"}}
        }
      },
      "/api/instagram/audience": {
        "get": {
          "operationId": "getInstagramAudience",
          "summary": "Get Instagram creator audience demographics",
          "parameters": [{"name": "uniqueId", "in": "query", "required": true, "schema": {"type": "string"}}],
          "responses": {"200": {"description": "Audience data"}}
        }
      },
      "/api/instagram/natural-language-search": {
        "post": {
          "operationId": "instagramNaturalLanguageSearch",
          "summary": "Search Instagram creators using natural language",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["query"],
                  "properties": {
                    "query": {"type": "string", "description": "Natural language search query"},
                    "pageSize": {"type": "integer", "default": 20},
                    "offset": {"type": "integer", "default": 0}
                  }
                }
              }
            }
          },
          "responses": {"200": {"description": "Search results"}}
        }
      },
      "/api/youtube/profile": {
        "get": {
          "operationId": "getYoutubeProfile",
          "summary": "Get YouTube channel profile",
          "parameters": [{"name": "channelId", "in": "query", "required": true, "schema": {"type": "string"}}],
          "responses": {"200": {"description": "Profile data"}}
        }
      },
      "/api/youtube/natural-language-search": {
        "post": {
          "operationId": "youtubeNaturalLanguageSearch",
          "summary": "Search YouTube creators using natural language",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["query"],
                  "properties": {
                    "query": {"type": "string"},
                    "pageSize": {"type": "integer", "default": 20},
                    "offset": {"type": "integer", "default": 0}
                  }
                }
              }
            }
          },
          "responses": {"200": {"description": "Search results"}}
        }
      },
      "/api/tiktok/profile": {
        "get": {
          "operationId": "getTiktokProfile",
          "summary": "Get TikTok creator profile",
          "parameters": [{"name": "uniqueId", "in": "query", "required": true, "schema": {"type": "string"}}],
          "responses": {"200": {"description": "Profile data"}}
        }
      },
      "/api/tiktok/natural-language-search": {
        "post": {
          "operationId": "tiktokNaturalLanguageSearch",
          "summary": "Search TikTok creators using natural language",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["query"],
                  "properties": {
                    "query": {"type": "string"},
                    "pageSize": {"type": "integer", "default": 20},
                    "offset": {"type": "integer", "default": 0}
                  }
                }
              }
            }
          },
          "responses": {"200": {"description": "Search results"}}
        }
      }
    }
  };
  res.json(openApiSpec);
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "CreatorDB API Wrapper",
    description: "HTTP API wrapper for ChatGPT Custom GPTs - Influencer Marketing Data",
    openapi: "/openapi.json",
    platforms: ["instagram", "youtube", "tiktok"]
  });
});

export default app;
