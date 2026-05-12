#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { HAClient } from './ha-client.js';
import { tools } from './tools/index.js';
import { toolHandlers } from './handlers.js';
import { normalizeToolArgs } from './arg-normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let MCP_VERSION = '0.0.0';
try {
  const packagePath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  MCP_VERSION = packageJson.version;
} catch {
  // fallback if package.json unreadable
}

// Get configuration from environment
const HA_AGENT_URL = process.env.HA_AGENT_URL || 'http://homeassistant.local:8099';
const HA_AGENT_KEY = process.env.HA_AGENT_KEY;

if (!HA_AGENT_KEY) {
  console.error('');
  console.error('❌ HA_AGENT_KEY is not set.');
  console.error('');
  console.error('To use this MCP you need the HA Vibecode Agent running inside Home Assistant.');
  console.error('');
  console.error('  1. Install the agent add-on:');
  console.error('     https://github.com/Coolver/home-assistant-vibecode-agent');
  console.error('');
  console.error('  2. Open the add-on Web UI to get your API key and MCP config.');
  console.error('');
  console.error('  3. Set HA_AGENT_URL and HA_AGENT_KEY in your IDE\'s MCP config.');
  console.error('');
  process.exit(1);
}

// Initialize HA client
const haClient = new HAClient({
  baseURL: HA_AGENT_URL,
  token: HA_AGENT_KEY,
});

// Create MCP server
const server = new Server(
  {
    name: 'home-assistant-mcp',
    version: MCP_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: 'text', text: 'Error: No arguments provided' }],
      isError: true,
    };
  }

  try {
    // Look up handler from registry
    const handler = toolHandlers[name];
    
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    // Execute handler
    const normalizedArgs = normalizeToolArgs(name, args as Record<string, unknown>);
    return await handler(haClient, normalizedArgs);
  } catch (error: any) {
    let errorMessage: string;
    
    // Handle axios errors
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (typeof data.detail === 'object') {
        errorMessage = JSON.stringify(data.detail, null, 2);
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object') {
        errorMessage = JSON.stringify(data, null, 2);
      } else {
        errorMessage = String(data);
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'object') {
      errorMessage = JSON.stringify(error, null, 2);
    } else {
      errorMessage = String(error || 'Unknown error');
    }
    
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  // Test connection on startup
  try {
    const health = await haClient.healthCheck();
    // Only log connection info if DEBUG mode is enabled (to avoid cluttering logs)
    // In production, connection is silent unless there's an error
    if (process.env.DEBUG === 'true') {
      console.error(`✅ Connected to HA Vibecode Agent v${health.version}`);
      console.error(`📁 Config path: ${health.config_path}`);
      console.error(`🔄 Git versioning auto: ${health.git_versioning_auto}`);
    }
  } catch (error: any) {
    // Always log errors - these are important
    console.error('');
    console.error('❌ Cannot reach HA Vibecode Agent');
    console.error(`   URL:   ${HA_AGENT_URL}`);
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('Checklist:');
    console.error('  1. The agent add-on is installed and running in Home Assistant.');
    console.error('     https://github.com/Coolver/home-assistant-vibecode-agent');
    console.error('  2. HA_AGENT_URL points to the correct host and port.');
    console.error('  3. HA_AGENT_KEY matches the key shown in the add-on Web UI.');
    console.error('');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Graceful shutdown
  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  if (process.env.DEBUG === 'true') {
    console.error('MCP Home Assistant server running');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
