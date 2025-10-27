import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Config } from "../config-loader.js";
import { createMigrationPromptRequestSchema } from "../schemas/create-migration";
import { agrotraceMigration } from "./agrotrace-migration";
import { checkmilkMigration } from "./checkmilk-migration";

function registerPrompts(server: McpServer, config?: Config) {
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

	if (config?.prompts && config.prompts.length > 0) {
		for (const prompt of config.prompts) {
			const argsSchema = prompt.enableUserInstructions
				? z.object({ userInstructions: z.string().optional() }).shape
				: z.object({}).shape;

			const text = (args: { userInstructions?: string }) => {
				if (prompt.enableUserInstructions) {
					return `${prompt.prompt}
          ${
						args.userInstructions
							? `User Instructions:
          ${args.userInstructions}`
							: ""
					}`;
				}
				return prompt.prompt;
			};

			server.registerPrompt(
				prompt.name,
				{
					title: prompt.title,
					description: prompt.description,
					argsSchema,
				},
				(args) => ({
					messages: [
						{
							role: "user",
							content: {
								type: "text",
								text: text(args),
							},
						},
					],
				}),
			);
		}
	}
}

export { registerPrompts };
