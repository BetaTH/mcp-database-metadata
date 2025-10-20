import { DatabaseConnections } from "../schemas/config";

export function createGetDatabaseConnectionsAvailableToolFunction(
	databaseConnections: DatabaseConnections,
) {
	const getDatabaseConnectionsAvailable = async () => {
		return {
			databases: databaseConnections.map(
				(databaseConnection) => databaseConnection.connectionName,
			),
		};
	};
	return getDatabaseConnectionsAvailable;
}
