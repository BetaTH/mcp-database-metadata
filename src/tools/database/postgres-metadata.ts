import { Knex } from "knex";
import {
	ConstraintInfo,
	IndexInfo,
	TriggerInfo,
} from "../../schemas/get-table-details";

export async function getPrimaryKey(
	db: Knex,
	tableName: string,
): Promise<ConstraintInfo | undefined> {
	const result = await db.raw(
		`
        SELECT
            tc.constraint_name AS name,
            kcu.column_name AS column_name
        FROM
            information_schema.table_constraints AS tc
        JOIN
            information_schema.key_column_usage AS kcu
        ON
            tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE
            tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name = ?;
    `,
		[tableName],
	);

	const rows = result.rows;
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
): Promise<ConstraintInfo[]> {
	const result = await db.raw(
		`
        SELECT
            tc.constraint_name AS name,
            kcu.column_name AS column_name,
            ccu.table_name AS referred_table,
            ccu.column_name AS referred_column
        FROM
            information_schema.table_constraints AS tc
        JOIN
            information_schema.key_column_usage AS kcu
        ON
            tc.constraint_name = kcu.constraint_name
        JOIN
            information_schema.constraint_column_usage AS ccu
        ON
            ccu.constraint_name = tc.constraint_name
        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ?;
    `,
		[tableName],
	);

	const rows = result.rows;
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
): Promise<IndexInfo[]> {
	const result = await db.raw(
		`
        SELECT
            indexname AS name,
            indexdef AS definition
        FROM
            pg_indexes
        WHERE
            tablename = ? AND indexname NOT LIKE '%_pkey';
    `,
		[tableName],
	);

	return result.rows.map((row: any) => {
		const columns =
			row.definition
				.match(/\((.*?)\)/)?.[1]
				.split(",")
				.map((c: string) => c.trim()) || [];
		return {
			name: row.name,
			columns,
			unique: row.definition.includes("UNIQUE"),
		};
	});
}

export async function getTriggers(
	db: Knex,
	tableName: string,
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
            event_object_table = ?;
    `,
		[tableName],
	);

	return result.rows;
}
