import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import { createGetTableDetailsToolFunction } from "../../src/tools/get-table-details";
import { createGetDdlDetailsToolFunction } from "../../src/tools/get-ddl-details";
import { DatabaseConnections } from "../../src/schemas/config";
import { tableDetailsResponseSchema } from "../../src/schemas/get-table-details";
import { ddlDetailsResponseSchema } from "../../src/schemas/get-ddl-details";

const testDbConfigs: DatabaseConnections = [
	{
		connectionName: "mysqldb",
		config: {
			client: "mysql2",
			connection: {
				host: "localhost",
				port: 33306,
				user: "testuser",
				password: "testpassword",
				database: "testdb",
			},
		},
	},
	{
		connectionName: "postgresdb",
		config: {
			client: "pg",
			connection: {
				host: "localhost",
				port: 55432,
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
		execSync(
			"docker compose -f tests/integration/test-db/docker-compose.yml up -d --wait",
			{ stdio: "inherit" },
		);
		console.log("Databases are ready.");
	}, 100000); // Aumenta o timeout para o beforeAll

	afterAll(() => {
		console.log("Tearing down test databases...");
		execSync(
			"docker compose -f tests/integration/test-db/docker-compose.yml down -v",
			{ stdio: "inherit" },
		);
		console.log("Databases torn down.");
	}, 100000);

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

	it("should return the DDL for an existing MySQL stored procedure", async () => {
		const getDdlDetails = createGetDdlDetailsToolFunction(testDbConfigs);

		const result = await getDdlDetails({
			connectionName: "mysqldb",
			objectName: "get_user_count",
			objectType: "PROCEDURE",
		});

		expect(() => ddlDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.objectName).toBe("get_user_count");
		expect(result.objectType).toBe("PROCEDURE");
		expect(result.ddl).toBeTruthy();
		expect(result.ddl.toLowerCase()).toContain("select count");
	});

	it("should return the DDL for an existing MySQL function", async () => {
		const getDdlDetails = createGetDdlDetailsToolFunction(testDbConfigs);

		const result = await getDdlDetails({
			connectionName: "mysqldb",
			objectName: "get_username",
			objectType: "FUNCTION",
		});

		expect(() => ddlDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.objectName).toBe("get_username");
		expect(result.objectType).toBe("FUNCTION");
		expect(result.ddl).toBeTruthy();
		expect(result.ddl.toLowerCase()).toContain("select username");
	});

	it("should return the DDL for an existing MySQL table", async () => {
		const getDdlDetails = createGetDdlDetailsToolFunction(testDbConfigs);

		const result = await getDdlDetails({
			connectionName: "mysqldb",
			objectName: "users",
			objectType: "TABLE",
		});

		expect(() => ddlDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.objectName).toBe("users");
		expect(result.objectType).toBe("TABLE");
		expect(result.ddl).toBeTruthy();
		expect(result.ddl.toLowerCase()).toContain("create table");
	});

	it("should return the DDL for an existing MySQL view", async () => {
		const getDdlDetails = createGetDdlDetailsToolFunction(testDbConfigs);

		const result = await getDdlDetails({
			connectionName: "mysqldb",
			objectName: "user_products",
			objectType: "VIEW",
		});

		expect(() => ddlDetailsResponseSchema.parse(result)).not.toThrow();
		expect(result.objectName).toBe("user_products");
		expect(result.objectType).toBe("VIEW");
		expect(result.ddl).toBeTruthy();
		expect(result.ddl.toLowerCase()).toContain("select");
	});

	it("should throw a descriptive error for a non-existent object", async () => {
		const getDdlDetails = createGetDdlDetailsToolFunction(testDbConfigs);

		await expect(
			getDdlDetails({
				connectionName: "mysqldb",
				objectName: "this_procedure_does_not_exist",
				objectType: "PROCEDURE",
			}),
		).rejects.toThrow("this_procedure_does_not_exist");
	});
});
