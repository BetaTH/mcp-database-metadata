import { DatabaseConnections } from "../schemas/config";
import {
	ProcedureDetailsRequest,
	ProcedureDetailsResponse,
} from "../schemas/get-procedure-details";
import { getDbConnection } from "./database/get-db-connection";
import { getProcedureDdl } from "./database/get-procedure-ddl";

/**
 * Cria dinamicamente a função que busca o DDL completo de uma stored procedure
 * ou function no banco de dados especificado.
 */
export function createGetProcedureDetailsToolFunction(
	databaseConnections: DatabaseConnections,
) {
	const getProcedureDetails = async ({
		connectionName,
		procedureName,
		routineType,
	}: ProcedureDetailsRequest): Promise<ProcedureDetailsResponse> => {
		const db = getDbConnection(connectionName, databaseConnections);

		try {
			const ddl = await getProcedureDdl(db, procedureName, routineType);
			return { procedureName, routineType, ddl };
		} catch (error) {
			console.error("Erro ao buscar DDL da procedure:", error);
			throw new Error(
				`Não foi possível buscar o DDL para '${procedureName}'. Verifique se a rotina existe e as permissões de acesso.\nError: ${error}`,
			);
		} finally {
			await db.destroy();
		}
	};

	return getProcedureDetails;
}
