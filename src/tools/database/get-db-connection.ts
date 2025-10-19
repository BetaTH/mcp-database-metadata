import knex, { Knex } from "knex";
import { DatabasesConfig } from "../../schemas/config";

/**
 * Retorna uma instância do Knex para o banco de dados especificado.
 */
export function getDbConnection(
	connectionName: string,
	databases: DatabasesConfig,
): Knex {
	const config = databases.find(
		(database) => database.name === connectionName,
	)?.config;
	if (!config) {
		throw new Error(
			`Configuração de banco de dados não encontrada para: ${connectionName}`,
		);
	}
	return knex(config);
}
