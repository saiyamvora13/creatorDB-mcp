import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE_URL = "https://apiv3.creatordb.app";
const API_KEY = process.env.CREATORDB_API_KEY;

if (!API_KEY) {
  console.error("Error: CREATORDB_API_KEY environment variable is required");
  process.exit(1);
}

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

app.get("/api/usage", async (req: Request, res: Response) => {
  try {
    const params = new URLSearchParams();
    if (req.query.start) params.append("start", String(req.query.start));
    if (req.query.end) params.append("end", String(req.query.end));
    const queryString = params.toString();
    const result = await makeApiRequest(`/usage${queryString ? `?${queryString}` : ""}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/profile", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/profile?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/contact", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/contact?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/instagram/content-detail?contentId=${contentId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/performance", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/performance?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/performance-history", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/performance-history?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/sponsorship", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/sponsorship?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/audience", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/instagram/audience?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
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
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/instagram/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/instagram/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/instagram/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/instagram/niches");
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/profile", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/profile?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
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
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/performance", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/performance?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/performance-history", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/performance-history?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/youtube/content-detail?contentId=${contentId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/sponsorship", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/sponsorship?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/contact", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/contact?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/audience", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ success: false, error: "channelId is required" });
    const result = await makeApiRequest(`/youtube/audience?channelId=${channelId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/youtube/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/youtube/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/topics", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/youtube/topics");
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/youtube/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/youtube/niches");
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/profile", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/profile?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
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
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/contact", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/contact?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/performance", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/performance?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/performance-history", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/performance-history?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/content-detail", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ success: false, error: "contentId is required" });
    const result = await makeApiRequest(`/tiktok/content-detail?contentId=${contentId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/audience", async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) return res.status(400).json({ success: false, error: "uniqueId is required" });
    const result = await makeApiRequest(`/tiktok/audience?uniqueId=${uniqueId}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/tiktok/natural-language-search", async (req: Request, res: Response) => {
  try {
    const { query, pageSize = 20, offset = 0 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query is required" });
    const result = await makeApiRequest("/tiktok/nls", "POST", { query, pageSize, offset });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/tiktok/niches", async (_req: Request, res: Response) => {
  try {
    const result = await makeApiRequest("/tiktok/niches");
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.sendFile("openapi.json", { root: "." });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "CreatorDB API Wrapper",
    description: "HTTP API wrapper for ChatGPT Custom GPTs - Influencer Marketing Data",
    openapi: "/openapi.json",
    endpoints: {
      instagram: [
        "GET /api/instagram/profile?uniqueId=",
        "GET /api/instagram/contact?uniqueId=",
        "GET /api/instagram/content-detail?contentId=",
        "GET /api/instagram/performance?uniqueId=",
        "GET /api/instagram/performance-history?uniqueId=",
        "GET /api/instagram/sponsorship?uniqueId=",
        "GET /api/instagram/audience?uniqueId=",
        "POST /api/instagram/search",
        "POST /api/instagram/natural-language-search",
        "GET /api/instagram/niches"
      ],
      youtube: [
        "GET /api/youtube/profile?channelId=",
        "POST /api/youtube/search",
        "GET /api/youtube/performance?channelId=",
        "GET /api/youtube/performance-history?channelId=",
        "GET /api/youtube/content-detail?contentId=",
        "GET /api/youtube/sponsorship?channelId=",
        "GET /api/youtube/contact?channelId=",
        "GET /api/youtube/audience?channelId=",
        "POST /api/youtube/natural-language-search",
        "GET /api/youtube/topics",
        "GET /api/youtube/niches"
      ],
      tiktok: [
        "GET /api/tiktok/profile?uniqueId=",
        "POST /api/tiktok/search",
        "GET /api/tiktok/contact?uniqueId=",
        "GET /api/tiktok/performance?uniqueId=",
        "GET /api/tiktok/performance-history?uniqueId=",
        "GET /api/tiktok/content-detail?contentId=",
        "GET /api/tiktok/audience?uniqueId=",
        "POST /api/tiktok/natural-language-search",
        "GET /api/tiktok/niches"
      ],
      general: [
        "GET /api/usage?start=&end="
      ]
    }
  });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`CreatorDB API server running on http://0.0.0.0:${PORT}`);
  console.log(`OpenAPI spec available at http://0.0.0.0:${PORT}/openapi.json`);
});
