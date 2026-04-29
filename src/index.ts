import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import { createMcpServer } from "./mcp-server";
import { loadConfiguration } from "./config-loader";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const app = express();
const port = process.env.PORT || 3000;
const config = loadConfiguration(process.env.MCP_CONFIG_PATH);
const sessionTransports = new Map<
	string,
	{ server: McpServer; transport: StreamableHTTPServerTransport }
>();

async function handleStatelessRequest(
	req: express.Request,
	res: express.Response,
) {
	const server = createMcpServer(config);
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	});

	try {
		await server.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} finally {
		res.on("close", async () => {
			await transport.close();
			await server.close();
		});
	}
}

app.use(express.json());

app.post("/mcp", async (req, res) => {
	try {
		const sessionIdHeader = req.headers["mcp-session-id"];
		const sessionId =
			typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;

		if (sessionId) {
			const session = sessionTransports.get(sessionId);
			if (!session) {
				res.status(400).json({
					jsonrpc: "2.0",
					error: {
						code: -32000,
						message: "Bad Request: invalid session ID",
					},
					id: null,
				});
				return;
			}

			await session.transport.handleRequest(req, res, req.body);
			return;
		}

		if (!isInitializeRequest(req.body)) {
			await handleStatelessRequest(req, res);
			return;
		}

		const server = createMcpServer(config);
		let transport: StreamableHTTPServerTransport;
		transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			enableJsonResponse: true,
			onsessioninitialized: (initializedSessionId) => {
				sessionTransports.set(initializedSessionId, { server, transport });
			},
		});

		transport.onclose = async () => {
			const activeSessionId = transport.sessionId;
			if (activeSessionId) {
				sessionTransports.delete(activeSessionId);
			}
			await server.close();
		};

		await server.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		console.error("Error handling MCP POST request:", error);
		if (!res.headersSent) {
			res.status(500).json({
				jsonrpc: "2.0",
				error: {
					code: -32603,
					message: "Internal server error",
				},
				id: null,
			});
		}
	}
});

app.get("/mcp", async (req, res) => {
	const sessionIdHeader = req.headers["mcp-session-id"];
	const sessionId =
		typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;

	if (!sessionId) {
		res.status(405).json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: "Method not allowed. Session ID required.",
			},
			id: null,
		});
		return;
	}

	const session = sessionTransports.get(sessionId);
	if (!session) {
		res.status(400).json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: "Bad Request: invalid session ID",
			},
			id: null,
		});
		return;
	}

	await session.transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
	const sessionIdHeader = req.headers["mcp-session-id"];
	const sessionId =
		typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;

	if (!sessionId) {
		res.status(400).json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: "Bad Request: session ID required",
			},
			id: null,
		});
		return;
	}

	const session = sessionTransports.get(sessionId);
	if (!session) {
		res.status(400).json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: "Bad Request: invalid session ID",
			},
			id: null,
		});
		return;
	}

	await session.transport.handleRequest(req, res);
});

app.listen(port, () => {
	console.log(`MCP server rodando em http://localhost:${port}`);
});
