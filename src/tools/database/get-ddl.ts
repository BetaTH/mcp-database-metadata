import { Knex } from "knex";
import type { ObjectType } from "../../schemas/get-ddl-details";

/**
 * Obtém o DDL completo de uma stored procedure, function, view ou tabela MySQL
 * via SHOW CREATE. Para procedures/functions, faz fallback para
 * INFORMATION_SCHEMA.ROUTINES caso o comando principal falhe.
 */
export async function getDdl(
	db: Knex,
	objectName: string,
	objectType: ObjectType = "PROCEDURE",
): Promise<string> {
	const ddlFromShow = await tryShowCreate(db, objectName, objectType);
	if (ddlFromShow) {
		return ddlFromShow;
	}

	if (objectType === "PROCEDURE" || objectType === "FUNCTION") {
		return fetchFromInformationSchema(db, objectName, objectType);
	}

	throw new Error(
		`${objectType} '${objectName}' não encontrada no banco de dados.`,
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SHOW_CREATE_COMMANDS: Record<ObjectType, string> = {
	PROCEDURE: "SHOW CREATE PROCEDURE",
	FUNCTION: "SHOW CREATE FUNCTION",
	VIEW: "SHOW CREATE VIEW",
	TABLE: "SHOW CREATE TABLE",
};

const DDL_FIELD_NAMES: Record<ObjectType, string> = {
	PROCEDURE: "Create Procedure",
	FUNCTION: "Create Function",
	VIEW: "Create View",
	TABLE: "Create Table",
};

async function tryShowCreate(
	db: Knex,
	objectName: string,
	objectType: ObjectType,
): Promise<string | null> {
	const command = SHOW_CREATE_COMMANDS[objectType];

	try {
		// ?? escapes the identifier with backticks (mysql2 convention)
		const result = await db.raw(`${command} ??`, [objectName]);

		// mysql2 wraps results in result[0]; handle both shapes for safety
		const rows: Record<string, unknown>[] = Array.isArray(result[0])
			? result[0]
			: result;

		if (!rows || rows.length === 0) {
			return null;
		}

		const row = rows[0];
		const fieldName = DDL_FIELD_NAMES[objectType];
		const ddl = row[fieldName];

		if (typeof ddl === "string" && ddl.trim().length > 0) {
			return ddl;
		}

		return null;
	} catch {
		// Insufficient privilege or object not found — proceed to fallback
		return null;
	}
}

async function fetchFromInformationSchema(
	db: Knex,
	objectName: string,
	routineType: "PROCEDURE" | "FUNCTION",
): Promise<string> {
	const result = await db.raw(
		`SELECT ROUTINE_DEFINITION
         FROM INFORMATION_SCHEMA.ROUTINES
         WHERE ROUTINE_TYPE = ?
           AND ROUTINE_NAME = ?`,
		[routineType, objectName],
	);

	const rows: Record<string, unknown>[] = Array.isArray(result[0])
		? result[0]
		: result;

	if (!rows || rows.length === 0) {
		throw new Error(
			`${routineType} '${objectName}' não encontrada no banco de dados.`,
		);
	}

	const definition = rows[0].ROUTINE_DEFINITION;

	if (typeof definition !== "string" || definition.trim().length === 0) {
		throw new Error(
			`Definição da ${routineType} '${objectName}' não está disponível. Verifique se o usuário possui permissão de leitura em INFORMATION_SCHEMA.ROUTINES.`,
		);
	}

	return definition;
}
