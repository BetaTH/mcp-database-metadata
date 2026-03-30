import { Config } from "../schemas/config";
import {
	tableDetailsRequestSchema,
	tableDetailsResponseSchema,
} from "../schemas/get-table-details";
import { createGetTableDetailsToolFunction } from "./get-table-details";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDatabaseConnectionsAvailableResponse } from "../schemas/get-database-connections-available";
import { createGetDatabaseConnectionsAvailableToolFunction } from "./get-databases-connections-available";
import {
	procedureDetailsRequestSchema,
	procedureDetailsResponseSchema,
} from "../schemas/get-procedure-details";
import { createGetProcedureDetailsToolFunction } from "./get-procedure-details";

function registerTools(server: McpServer, config?: Config) {
	if (config) {
		const getTableDetails = createGetTableDetailsToolFunction(
			config.databaseConnections,
		);
		const getDatabaseConnectionsAvailable =
			createGetDatabaseConnectionsAvailableToolFunction(
				config.databaseConnections,
			);
		const getProcedureDetails = createGetProcedureDetailsToolFunction(
			config.databaseConnections,
		);

		server.registerTool(
			"get-databases-available",
			{
				title: "Banco de dados disponíveis",
				description:
					"Retorna o nome das conexões de banco de dados disponíveis",
				outputSchema: getDatabaseConnectionsAvailableResponse.shape,
			},
			async () => {
				const output = await getDatabaseConnectionsAvailable();
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

		server.registerTool(
			"get-procedure-details",
			{
				title: "DDL de procedure ou function",
				description:
					"Retorna o SQL completo (DDL) de uma stored procedure ou function MySQL a partir do nome da rotina",
				inputSchema: procedureDetailsRequestSchema.shape,
				outputSchema: procedureDetailsResponseSchema.shape,
			},
			async ({ connectionName, procedureName, routineType }) => {
				const output = await getProcedureDetails({
					connectionName,
					procedureName,
					routineType,
				});
				return {
					content: [{ type: "text", text: JSON.stringify(output) }],
					structuredContent: output,
				};
			},
		);
	}
}

export { registerTools };
