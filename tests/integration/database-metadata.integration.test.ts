import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import { createGetTableDetailsToolFunction } from "../../src/tools/get-table-details";
import { DatabasesConfig } from "../../src/schemas/config";
import { tableDetailsResponseSchema } from "../../src/schemas/get-table-details";

const testDbConfigs: DatabasesConfig = [
	{
		name: "mysqldb",
		config: {
			client: "mysql2",
			connection: {
				host: "localhost",
				port: 3306,
				user: "testuser",
				password: "testpassword",
				database: "testdb",
			},
		},
	},
	{
		name: "postgresdb",
		config: {
			client: "pg",
			connection: {
				host: "localhost",
				port: 5432,
				user: "testuser",
				password: "testpassword",
				database: "testdb",
			},
		},
	},
];

describe("createGetTableDetailsToolFunction - Integration", () => {
	beforeAll(() => {
		console.log("Starting test databases with Docker Compose...");
		execSync("docker compose -f tests/integration/test-db/docker-compose.yml up -d --wait", { stdio: "inherit" });
		console.log("Databases are ready.");
	}, 60000); // Aumenta o timeout para o beforeAll

	afterAll(() => {
		console.log("Tearing down test databases...");
		execSync("docker compose -f tests/integration/test-db/docker-compose.yml down -v", { stdio: "inherit" });
		console.log("Databases torn down.");
	});

	it("should return full details for a MySQL table and parse correctly", async () => {
		const getTableDetails = createGetTableDetailsToolFunction(testDbConfigs);
		const result = await getTableDetails({
			connectionName: "mysqldb",
			tableName: "users",
		});

		expect(() => tableDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.tableName).toBe("users");
		expect(result.primaryKeyConstraint?.columns).toEqual(["id"]);
		expect(result.indexes.length).toBeGreaterThan(0);
	});

	it("should return full details for a PostgreSQL table and parse correctly", async () => {
		const getTableDetails = createGetTableDetailsToolFunction(testDbConfigs);
		const result = await getTableDetails({
			connectionName: "postgresdb",
			tableName: "products",
		});

		expect(() => tableDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.tableName).toBe("products");
		expect(result.primaryKeyConstraint?.columns).toEqual(["id"]);
		expect(result.foreignKeyConstraints.length).toBe(1);
		expect(result.triggers.length).toBe(1);
	});
});
