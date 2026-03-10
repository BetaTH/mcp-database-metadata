import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Config } from "./schemas/config";
import { registerPrompts } from "./prompts/register-prompts";
import { registerTools } from "./tools/register-tools";

function createMcpServer(config?: Config) {
	const server = new McpServer({
		name: "Database Table Details",
		version: "1.0.0",
		capabilities: {
			tools: {},
			prompts: {},
			resources: {},
		},
	});

	registerTools(server, config);
	registerPrompts(server, config);

	return server;
}

export { createMcpServer };
