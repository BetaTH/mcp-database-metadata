import {
	TableDetailsRequest,
	TableDetailsResponse,
} from "../schemas/get-table-details";
import { DatabaseConnections } from "../schemas/config";
import { getDbConnection } from "./database/get-db-connection";
import { getMetadataFetcher } from "./database/metadata-fetcher";
import { getColumnDetails } from "./database/get-column-details";

/**
 * Cria dinamicamente a função que busca os detalhes de uma tabela específica em um banco de dados.
 */
export function createGetTableDetailsToolFunction(
	databaseConnections: DatabaseConnections,
) {
	const getTableDetails = async ({
		connectionName,
		tableName,
	}: TableDetailsRequest): Promise<TableDetailsResponse> => {
		const db = getDbConnection(connectionName, databaseConnections);

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const databaseName = databaseConnections.find(
			(dbConnection) => dbConnection.connectionName === connectionName,
		)!.config.connection.database;

		const fetcher = getMetadataFetcher(db.client.config.client);

		try {
			const columns = await getColumnDetails(db, tableName);
			if (!fetcher) {
				return {
					tableName: tableName,
					columns: columns,
					primaryKeyConstraint: undefined,
					foreignKeyConstraints: [],
					indexes: [],
					triggers: [],
				};
			}

			const [primaryKeyConstraint, foreignKeyConstraints, indexes, triggers] =
				await Promise.all([
					fetcher.getPrimaryKey(db, tableName, databaseName),
					fetcher.getForeignKeys(db, tableName, databaseName),
					fetcher.getIndexes(db, tableName, databaseName),
					fetcher.getTriggers(db, tableName, databaseName),
				]);

			// Adiciona a informação de chave primária às colunas correspondentes
			if (primaryKeyConstraint) {
				for (const column of columns) {
					if (primaryKeyConstraint.columns.includes(column.name)) {
						column.primary_key = true;
					}
				}
			}

			return {
				tableName,
				columns,
				primaryKeyConstraint,
				foreignKeyConstraints,
				indexes,
				triggers,
			};
		} catch (error) {
			console.error("Erro ao buscar detalhes da tabela:", error);
			throw new Error(
				`Não foi possível buscar detalhes para a tabela '${tableName}'. Verifique se a tabela existe e as permissões de acesso.
        Error: ${error}
        `,
			);
		} finally {
			await db.destroy(); // Fecha a conexão com o banco
		}
	};

	return getTableDetails;
}
