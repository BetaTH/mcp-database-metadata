
import { describe, it, expect } from "vitest";
import { configSchema } from "../src/schemas/config";

describe("configSchema", () => {
	it("should parse a valid configuration successfully", () => {
		const validConfig = {
			databaseConnections: [
				{
					connectionName: "testdb1",
					config: {
						client: "mysql2",
						connection: {
							host: "localhost",
							port: 3306,
							user: "user",
							password: "password",
							database: "database",
						},
					},
				},
				{
					connectionName: "testdb2",
					config: {
						client: "pg",
						connection: {
							host: "localhost",
							port: 5432,
							user: "user",
							password: "password",
							database: "database",
						},
					},
				},
			],
		};

		expect(() => configSchema.parse(validConfig)).not.toThrow();
	});

	it("should throw an error for an invalid configuration", () => {
		const invalidConfig = {
			databaseConnections: [
				{
					connectionName: "testdb1",
					config: {
						client: "mysql2",
						connection: {
							host: "localhost",
							port: -3306, // Invalid port
							user: "user",
							password: "password",
							database: "database",
						},
					},
				},
			],
		};

		expect(() => configSchema.parse(invalidConfig)).toThrow();
	});

	it("should throw an error if databaseConnections is missing", () => {
		const invalidConfig = {}; // Missing databaseConnections
		expect(() => configSchema.parse(invalidConfig)).toThrow();
	});

	it("should throw an error if connectionName is missing", () => {
		const invalidConfig = {
			databaseConnections: [
				{
					// connectionName: "testdb1", // Missing connectionName
					config: {
						client: "mysql2",
						connection: {
							host: "localhost",
							port: 3306,
							user: "user",
							password: "password",
							database: "database",
						},
					},
				},
			],
		};
		expect(() => configSchema.parse(invalidConfig)).toThrow();
	});
});
