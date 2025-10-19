import { Config } from "../schemas/config";
import {
	tableDetailsRequestSchema,
	tableDetailsResponseSchema,
} from "../schemas/get-table-details";
import { createGetDatabasesAvailableToolFunction } from "./get-databases-available";
import { createGetTableDetailsToolFunction } from "./get-table-details";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDatabasesAvailableResponse } from "../schemas/get-databases-available";

function registerTools(server: McpServer, config?: Config) {
	if (config) {
		const getTableDetails = createGetTableDetailsToolFunction(config.databases);
		const getDatabasesAvailable = createGetDatabasesAvailableToolFunction(
			config.databases,
		);

		server.registerTool(
			"get-databases-available",
			{
				title: "Banco de dados disponíveis",
				description: "Retorna o nome dos bancos disponíveis",
				outputSchema: getDatabasesAvailableResponse.shape,
			},
			async () => {
				const output = await getDatabasesAvailable();
				return {
					content: [{ type: "text", text: JSON.stringify(output) }],
					structuredContent: output,
				};
			},
		);

		server.registerTool(
			"get-table-details",
			{
				title: "Detalhes de tabela",
				description: "Busca detalhes de um tabela a partir do nome de um banco",
				inputSchema: tableDetailsRequestSchema.shape,
				outputSchema: tableDetailsResponseSchema.shape,
			},
			async ({ connectionName, tableName }) => {
				const output = await getTableDetails({ connectionName, tableName });
				return {
					content: [{ type: "text", text: JSON.stringify(output) }],
					structuredContent: output,
				};
			},
		);
	}
}

export { registerTools };
