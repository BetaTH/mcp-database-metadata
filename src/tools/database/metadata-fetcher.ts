import { Knex } from "knex";
import {
	ConstraintInfo,
	IndexInfo,
	TriggerInfo,
} from "../../schemas/get-table-details";
import * as mysql from "./mysql-metadata";
import * as postgres from "./postgres-metadata";

// Interface unificada para as funções de metadados
export interface IMetadataFetcher {
	getPrimaryKey(
		db: Knex,
		tableName: string,
		databaseName: string,
	): Promise<ConstraintInfo | undefined>;
	getForeignKeys(
		db: Knex,
		tableName: string,
		databaseName: string,
	): Promise<ConstraintInfo[]>;
	getIndexes(
		db: Knex,
		tableName: string,
		databaseName: string,
	): Promise<IndexInfo[]>;
	getTriggers(
		db: Knex,
		tableName: string,
		databaseName: string,
	): Promise<TriggerInfo[]>;
}

// Mapeia um cliente knex para a sua implementação de fetcher
const fetchers: Record<string, IMetadataFetcher> = {
	mysql: mysql,
	mysql2: mysql,
	pg: postgres,
	postgres: postgres,
};

/**
 * Retorna o fetcher de metadados apropriado para o cliente de banco de dados.
 * @param client - O nome do cliente knex (ex: 'mysql2', 'pg').
 */
export function getMetadataFetcher(client: string): IMetadataFetcher | null {
	const fetcher = fetchers[client];
	if (!fetcher) {
		console.warn(
			`Metadata fetcher para o cliente '${client}' não implementado.`,
		);
		return null;
	}
	return fetcher;
}
