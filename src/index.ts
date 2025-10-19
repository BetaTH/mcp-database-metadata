import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpServer } from "./mcp-server";
import { registerTools } from "./tools/register-tools";
import { registerPrompts } from "./prompts/register-prompts";
import { loadConfiguration } from "./config-loader";

const app = express();
const port = process.env.PORT || 3000;

function initServer() {
	const config = loadConfiguration(process.env.MCP_CONFIG_PATH);

	registerTools(mcpServer, config);
	registerPrompts(mcpServer);
}

initServer();

app.use(express.json());

app.post("/mcp", async (req, res) => {
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	});

	res.on("close", () => {
		transport.close();
	});

	await mcpServer.connect(transport);
	await transport.handleRequest(req, res, req.body);
});

app.listen(port, () => {
	console.log(`MCP server rodando em http://localhost:${port}`);
});
