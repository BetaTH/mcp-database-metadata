import { DatabasesConfig } from "../schemas/config";

export function createGetDatabasesAvailableToolFunction(
	databases: DatabasesConfig,
) {
	const getDatabasesAvailable = async () => {
		return {
			databases: databases.map((databases) => databases.name),
		};
	};
	return getDatabasesAvailable;
}
