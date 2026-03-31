import { DatabaseConnections } from "../schemas/config";
import {
	DdlDetailsRequest,
	DdlDetailsResponse,
} from "../schemas/get-ddl-details";
import { getDbConnection } from "./database/get-db-connection";
import { getDdl } from "./database/get-ddl";

/**
 * Cria dinamicamente a função que busca o DDL completo de uma stored procedure,
 * function, view ou tabela no banco de dados especificado.
 */
export function createGetDdlDetailsToolFunction(
	databaseConnections: DatabaseConnections,
) {
	const getDdlDetails = async ({
		connectionName,
		objectName,
		objectType,
	}: DdlDetailsRequest): Promise<DdlDetailsResponse> => {
		const db = getDbConnection(connectionName, databaseConnections);

		try {
			const ddl = await getDdl(db, objectName, objectType);
			return { objectName, objectType, ddl };
		} catch (error) {
			console.error("Erro ao buscar DDL:", error);
			throw new Error(
				`Não foi possível buscar o DDL para '${objectName}'. Verifique se o objeto existe e as permissões de acesso.\nError: ${error}`,
			);
		} finally {
			await db.destroy();
		}
	};

	return getDdlDetails;
}
