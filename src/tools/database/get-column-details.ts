import { Knex } from "knex";
import { ColumnInfo } from "../../schemas/get-table-details";

/**
 * Busca informações detalhadas sobre as colunas de uma tabela.
 * Usa o método `columnInfo` do Knex.
 */
export async function getColumnDetails(
	db: Knex,
	tableName: string,
): Promise<ColumnInfo[]> {
	const columnInfo = await db(tableName).columnInfo();
	const columns: ColumnInfo[] = [];

	for (const columnName in columnInfo) {
		const info = columnInfo[columnName];
		columns.push({
			name: columnName,
			type: info.type,
			nullable: info.nullable,
			default: info.defaultValue as string,
			primary_key: false, // A informação de PK geralmente vem de uma consulta separada de constraints
		});
	}
	return columns;
}
