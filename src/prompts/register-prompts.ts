import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMigrationPromptRequestSchema } from "../schemas/create-migration";
import { agrotraceMigration } from "./agrotrace-migration";

function registerPrompts(server: McpServer) {
	server.registerPrompt(
		"agrotrace-migration-prompt",
		{
			title: "Create Agrotrace Migrations",
			description: "Facilita a criação de migrations para o banco agrotrace",
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
}

export { registerPrompts };
