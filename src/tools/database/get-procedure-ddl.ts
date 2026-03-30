import { Knex } from "knex";
import type { RoutineType } from "../../schemas/get-procedure-details";

/**
 * Obtém o DDL completo de uma stored procedure ou function MySQL via SHOW CREATE.
 * Faz fallback para INFORMATION_SCHEMA.ROUTINES caso o comando principal falhe ou
 * retorne resultado vazio (ex.: falta de permissão SHOW_ROUTINE_ACL).
 */
export async function getProcedureDdl(
	db: Knex,
	procedureName: string,
	routineType: RoutineType = "PROCEDURE",
): Promise<string> {
	const ddlFromShow = await tryShowCreate(db, procedureName, routineType);
	if (ddlFromShow) {
		return ddlFromShow;
	}

	return fetchFromInformationSchema(db, procedureName, routineType);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tryShowCreate(
	db: Knex,
	procedureName: string,
	routineType: RoutineType,
): Promise<string | null> {
	const command =
		routineType === "FUNCTION"
			? "SHOW CREATE FUNCTION"
			: "SHOW CREATE PROCEDURE";

	try {
		// ?? escapes the identifier with backticks (mysql2 convention)
		const result = await db.raw(`${command} ??`, [procedureName]);

		// mysql2 wraps results in result[0]; handle both shapes for safety
		const rows: Record<string, unknown>[] = Array.isArray(result[0])
			? result[0]
			: result;

		if (!rows || rows.length === 0) {
			return null;
		}

		const row = rows[0];
		// The column is named "Create Procedure" or "Create Function"
		const fieldName =
			routineType === "FUNCTION" ? "Create Function" : "Create Procedure";
		const ddl = row[fieldName];

		if (typeof ddl === "string" && ddl.trim().length > 0) {
			return ddl;
		}

		return null;
	} catch {
		// Insufficient privilege or routine not found — proceed to fallback
		return null;
	}
}

async function fetchFromInformationSchema(
	db: Knex,
	procedureName: string,
	routineType: RoutineType,
): Promise<string> {
	const result = await db.raw(
		`SELECT ROUTINE_DEFINITION
         FROM INFORMATION_SCHEMA.ROUTINES
         WHERE ROUTINE_TYPE = ?
           AND ROUTINE_NAME = ?`,
		[routineType, procedureName],
	);

	const rows: Record<string, unknown>[] = Array.isArray(result[0])
		? result[0]
		: result;

	if (!rows || rows.length === 0) {
		throw new Error(
			`${routineType} '${procedureName}' não encontrada no banco de dados.`,
		);
	}

	const definition = rows[0].ROUTINE_DEFINITION;

	if (typeof definition !== "string" || definition.trim().length === 0) {
		throw new Error(
			`Definição da ${routineType} '${procedureName}' não está disponível. Verifique se o usuário possui permissão de leitura em INFORMATION_SCHEMA.ROUTINES.`,
		);
	}

	return definition;
}
