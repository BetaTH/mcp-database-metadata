import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMigrationPromptRequestSchema } from "../schemas/create-migration";
import { agrotraceMigration } from "./agrotrace-migration";
import { checkmilkMigration } from "./checkmilk-migration";

function registerPrompts(server: McpServer) {
	server.registerPrompt(
		"agrotrace-migration-prompt",
		{
			title: "Create Agrotrace Migrations",
			description:
				"Facilita a criação de migrations para o banco agrotrace, utilizando a conexão com o banco agrotrace",
			argsSchema: createMigrationPromptRequestSchema.shape,
		},
		(args) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: agrotraceMigration(args),
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"checkmilk-migration-prompt",
		{
			title: "Create Checkmilk Migrations",
			description:
				"Facilita a criação de migrations para o banco checkmilk, utilizando a conexão com o banco checkmilk",
			argsSchema: createMigrationPromptRequestSchema.shape,
		},
		(args) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: checkmilkMigration(args),
					},
				},
			],
		}),
	);
}

export { registerPrompts };
