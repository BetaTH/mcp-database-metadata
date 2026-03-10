#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp-server";
import path from "path";
import fs from "fs";
import os from "os";
import { Config } from "./schemas/config";
import { loadConfiguration } from "./config-loader";

export function createDefaultConfig(): Config {
	return {
		databaseConnections: [
			{
				connectionName: "example_db",
				config: {
					client: "pg",
					connection: {
						host: "127.0.0.1",
						port: 5432,
						user: "user",
						password: "password",
						database: "mydatabase",
					},
				},
			},
		],
	};
}

async function startServer(config?: Config) {
	const transport = new StdioServerTransport();
	const server = createMcpServer(config);

	await server.connect(transport);
	process.stdin.resume();

	console.error("🚀 Servidor MCP de Saudação iniciado!");
	console.error("📡 Aguardando conexões...");

	await new Promise(() => {});
}

function writeDefaultConfig() {
	const defaultConfig = createDefaultConfig();

	const globalConfigDir = path.join(os.homedir(), ".mcp-database-metadata");
	const globalConfigPath = path.join(globalConfigDir, "settings.json");

	if (!fs.existsSync(globalConfigDir)) {
		fs.mkdirSync(globalConfigDir, { recursive: true });
	}

	fs.writeFileSync(globalConfigPath, JSON.stringify(defaultConfig, null, 2));

	console.log(`Arquivo de configuração global criado em: ${globalConfigPath}`);

	const localConfigPath = "mcp-database-metadata.settings.json";
	console.log(
		`Você também pode criar um arquivo de configuração local neste diretório chamado '${localConfigPath}' para sobrescrever as configurações globais.
`,
	);
}

function parseArgs(argv: string[]) {
	const args = argv.slice(2);

	if (args[0] === "init") {
		return { command: "init" as const };
	}

	let configPath: string | undefined;
	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === "-c" || arg === "--config") {
			configPath = args[index + 1];
			index++;
		}
	}

	return {
		command: "start" as const,
		configPath,
	};
}

async function main(argv: string[]) {
	const parsedArgs = parseArgs(argv);

	if (parsedArgs.command === "init") {
		writeDefaultConfig();
		return;
	}

	const config = loadConfiguration(parsedArgs.configPath);
	await startServer(config);
}

if (require.main === module) {
	void main(process.argv);
}

export { main, parseArgs, writeDefaultConfig };
