# CreatorDB MCP Server

An MCP (Model Context Protocol) server that provides access to the CreatorDB Headless API V3 for influencer marketing data across Instagram, YouTube, and TikTok.

## Features

This MCP server exposes 31 tools covering all CreatorDB API V3 endpoints:

### General Operations
- **get_api_usage** - Get API usage statistics and quota consumption

### Instagram (11 tools)
- **instagram_get_profile** - Complete profile with metadata, stats, hashtags, niches
- **instagram_get_contact** - Contact information (emails)
- **instagram_get_content_detail** - Detailed content information
- **instagram_get_performance** - Engagement rates, likes, comments, consistency scores
- **instagram_get_performance_history** - Historical performance data
- **instagram_get_sponsorship** - Sponsored content information
- **instagram_get_audience** - Demographics: country, gender, age breakdown
- **instagram_search** - Advanced search with 10+ filter types
- **instagram_natural_language_search** - AI-powered natural language queries
- **instagram_get_niches** - All available niches with creator counts

### YouTube (11 tools)
- **youtube_get_profile** - Complete profile with pricing estimates, topics, niches
- **youtube_get_contact** - Contact information
- **youtube_get_content_detail** - Video details and performance
- **youtube_get_performance** - Views, engagement, content statistics
- **youtube_get_performance_history** - Historical performance data
- **youtube_get_sponsorship** - Sponsored content data
- **youtube_get_audience** - Audience demographics
- **youtube_search** - Advanced search with filters
- **youtube_natural_language_search** - AI-powered search
- **youtube_get_topics** - Content categories
- **youtube_get_niches** - Available niches

### TikTok (9 tools)
- **tiktok_get_profile** - Complete profile with follower stats, hashtags, niches
- **tiktok_get_contact** - Contact information
- **tiktok_get_content_detail** - Video details
- **tiktok_get_performance** - Engagement metrics
- **tiktok_get_performance_history** - Historical data
- **tiktok_get_audience** - Audience demographics
- **tiktok_search** - Advanced search with filters
- **tiktok_natural_language_search** - AI-powered search
- **tiktok_get_niches** - Available niches

## Installation

```bash
# Clone or copy this directory
cd creatordb-mcp

# Install dependencies
npm install

# Build the TypeScript
npm run build
```

## Configuration

Set your CreatorDB API key as an environment variable:

```bash
export CREATORDB_API_KEY="your-api-key-here"
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "creatordb": {
      "command": "node",
      "args": ["/path/to/creatordb-mcp/dist/index.js"],
      "env": {
        "CREATORDB_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Usage with Claude Code

```bash
# Add the MCP server
claude mcp add creatordb -- node /path/to/creatordb-mcp/dist/index.js

# Or with environment variable
CREATORDB_API_KEY=your-key claude mcp add creatordb -- node /path/to/creatordb-mcp/dist/index.js
```

## Development

```bash
# Run in development mode (without building)
npm run dev

# Build for production
npm run build

# Run built version
npm start
```

## API Details

- **Base URL**: `https://apiv3.creatordb.app`
- **Authentication**: API key via `api-key` header
- **Response format**: JSON with `success`, `data`, `traceId`, `timestamp` fields

## Example Tool Calls

### Search Instagram creators with filters
```json
{
  "name": "instagram_search",
  "arguments": {
    "filters": [
      { "filterName": "totalFollowers", "op": ">", "value": 100000 },
      { "filterName": "country", "op": "=", "value": "USA" },
      { "filterName": "niches", "op": "in", "value": ["fashion_Lifestyle"] }
    ],
    "pageSize": 20,
    "offset": 0,
    "sortBy": "totalFollowers",
    "desc": true
  }
}
```

### Natural language search
```json
{
  "name": "instagram_natural_language_search",
  "arguments": {
    "query": "fashion influencers in USA with over 100k followers",
    "pageSize": 20,
    "offset": 0
  }
}
```

### Get Instagram creator profile
```json
{
  "name": "instagram_get_profile",
  "arguments": {
    "uniqueId": "instagram"
  }
}
```

### Get YouTube creator profile
```json
{
  "name": "youtube_get_profile",
  "arguments": {
    "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
  }
}
```

### Get TikTok creator audience demographics
```json
{
  "name": "tiktok_get_audience",
  "arguments": {
    "uniqueId": "tiktok"
  }
}
```

### Search YouTube creators by topic
```json
{
  "name": "youtube_search",
  "arguments": {
    "filters": [
      { "filterName": "topics", "op": "in", "value": ["gaming_Gaming"] },
      { "filterName": "totalSubscribers", "op": ">", "value": 1000000 }
    ],
    "pageSize": 10,
    "offset": 0,
    "sortBy": "totalSubscribers",
    "desc": true
  }
}
```

## Filter Reference

### Common Filter Fields (all platforms)
- `displayName` - Creator display name (string, supports fuzzy search)
- `country` - Country code in ISO 3166-1 alpha-3 (e.g., "USA", "GBR", "TWN")
- `mainLanguage` - Primary language in ISO 639-3 (e.g., "eng", "zht")
- `niches` - Content niches (array of strings)
- `isVerified` - Verified account (boolean)
- `hasSponsors` - Has sponsored content (boolean)

### Instagram-specific
- `totalFollowers` - Follower count (number)
- `avgEngagementRate` - Average engagement rate (number, 0-1)

### YouTube-specific
- `totalSubscribers` - Subscriber count (number)
- `topics` - Content topics (array of strings)

### TikTok-specific
- `totalFollowers` - Follower count (number)

### Filter Operators
- `=` - Equals (strings, booleans)
- `>` - Greater than (numbers)
- `<` - Less than (numbers)
- `in` - Value in array (arrays of strings)

## Troubleshooting

### API Key Issues
- Ensure `CREATORDB_API_KEY` is set correctly
- Check if the key has sufficient credits
- Header format is `api-key: your-key` (not Bearer token)

### Common Errors
- `429` - Quota exceeded or rate limited
- `400` - Invalid parameters (check filter format)

## License

MIT
