#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./mcp-server";
import path from "path";
import fs from "fs";
import os from "os";
import { Config } from "./schemas/config";
import { registerTools } from "./tools/register-tools";
import { Command } from "commander";
import { registerPrompts } from "./prompts/register-prompts";
import { loadConfiguration } from "./config-loader";

async function startServer(config?: Config) {
	const transport = new StdioServerTransport();
	registerTools(mcpServer, config);
	registerPrompts(mcpServer, config);

	await mcpServer.connect(transport);

	console.error("🚀 Servidor MCP de Saudação iniciado!");
	console.error("📡 Aguardando conexões...");
}

const program = new Command();

program
	.name("meu-servidor-mpc-cli")
	.description(
		"Inicia um servidor MPC com configurações dinâmicas a partir de um arquivo JSON.",
	)
	.version("1.0.0")
	.option("-c, --config <path>", "Caminho para o arquivo de configuração JSON.")
	.action(async (options) => {
		const config = loadConfiguration(options.config);
		await startServer(config);
	});

program
	.command("init")
	.description("Cria arquivos de configuração iniciais.")
	.action(() => {
		const defaultConfig = {
			databases: [
				{
					name: "example_db",
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

		const globalConfigDir = path.join(os.homedir(), ".mcp-database-metadata");
		const globalConfigPath = path.join(globalConfigDir, "settings.json");

		if (!fs.existsSync(globalConfigDir)) {
			fs.mkdirSync(globalConfigDir, { recursive: true });
		}

		fs.writeFileSync(globalConfigPath, JSON.stringify(defaultConfig, null, 2));

		console.log(
			`Arquivo de configuração global criado em: ${globalConfigPath}`,
		);

		const localConfigPath = "mcp-database-metadata.settings.json";
		console.log(
			`Você também pode criar um arquivo de configuração local neste diretório chamado '${localConfigPath}' para sobrescrever as configurações globais.
`,
		);
	});

program.parse(process.argv);
