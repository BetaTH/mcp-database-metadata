import { Knex } from "knex";
import {
	ConstraintInfo,
	IndexInfo,
	TriggerInfo,
} from "../../schemas/get-table-details";

export async function getPrimaryKey(
	db: Knex,
	tableName: string,
	databaseName: string,
): Promise<ConstraintInfo | undefined> {
	const result = await db.raw(
		`
        SELECT
            kcu.constraint_name AS name,
            kcu.column_name AS column_name
        FROM
            information_schema.key_column_usage AS kcu
        JOIN
            information_schema.table_constraints AS tc
        ON
            kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
            AND kcu.table_name = tc.table_name
        WHERE
            tc.constraint_type = 'PRIMARY KEY'
            AND kcu.table_schema = ?
            AND kcu.table_name = ?;
    `,
		[databaseName, tableName],
	);

	const rows = result[0];
	if (rows.length === 0) {
		return undefined;
	}

	return {
		name: rows[0].name,
		columns: rows.map((row: { column_name: string }) => row.column_name),
	};
}

export async function getForeignKeys(
	db: Knex,
	tableName: string,
	databaseName: string,
): Promise<ConstraintInfo[]> {
	const result = await db.raw(
		`
        SELECT
            kcu.constraint_name AS name,
            kcu.column_name AS column_name,
            kcu.referenced_table_name AS referred_table,
            kcu.referenced_column_name AS referred_column
        FROM
            information_schema.key_column_usage AS kcu
        JOIN
            information_schema.table_constraints AS tc
        ON
            kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
            AND kcu.table_name = tc.table_name
        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND kcu.table_schema = ?
            AND kcu.table_name = ?;
    `,
		[databaseName, tableName],
	);

	const rows = result[0];
	const constraints: Record<string, ConstraintInfo> = {};

	for (const row of rows) {
		if (!constraints[row.name]) {
			constraints[row.name] = {
				name: row.name,
				columns: [],
				referred_table: row.referred_table,
				referred_columns: [],
			};
		}
		constraints[row.name].columns.push(row.column_name);
		constraints[row.name].referred_columns?.push(row.referred_column);
	}

	return Object.values(constraints);
}

export async function getIndexes(
	db: Knex,
	tableName: string,
	databaseName: string,
): Promise<IndexInfo[]> {
	const result = await db.raw(
		`
        SELECT
            stat.index_name AS name,
            stat.column_name AS column_name,
            stat.non_unique AS non_unique
        FROM
            information_schema.statistics AS stat
        WHERE
            stat.table_schema = ?
            AND stat.table_name = ?
            AND stat.index_name != 'PRIMARY';
    `,
		[databaseName, tableName],
	);

	const rows = result[0];
	const indexes: Record<string, IndexInfo> = {};

	for (const row of rows) {
		if (!indexes[row.name]) {
			indexes[row.name] = {
				name: row.name,
				columns: [],
				unique: row.non_unique === 0,
			};
		}
		indexes[row.name].columns.push(row.column_name);
	}

	return Object.values(indexes);
}

export async function getTriggers(
	db: Knex,
	tableName: string,
	databaseName: string,
): Promise<TriggerInfo[]> {
	const result = await db.raw(
		`
        SELECT
            trigger_name AS name,
            event_manipulation,
            action_timing,
            action_statement
        FROM
            information_schema.triggers
        WHERE
            event_object_schema = ?
            AND event_object_table = ?;
    `,
		[databaseName, tableName],
	);

	return result[0].map((row: any) => ({
		name: row.name,
		event_manipulation: row.EVENT_MANIPULATION,
		action_timing: row.ACTION_TIMING,
		action_statement: row.ACTION_STATEMENT,
	}));
}
