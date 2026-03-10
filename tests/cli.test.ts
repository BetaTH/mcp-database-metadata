import { describe, expect, it } from "vitest";
import { createDefaultConfig } from "../src/cli";
import { configSchema } from "../src/schemas/config";

describe("createDefaultConfig", () => {
	it("should generate a config compatible with the runtime schema", () => {
		const config = createDefaultConfig();

		expect(() => configSchema.parse(config)).not.toThrow();
		expect(config.databaseConnections[0]?.connectionName).toBe("example_db");
	});
});
