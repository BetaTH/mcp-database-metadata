import { z } from "zod";

export const ddlDetailsRequestSchema = z.object({
	connectionName: z.string(),
	objectName: z.string(),
	objectType: z
		.enum(["PROCEDURE", "FUNCTION", "VIEW", "TABLE"])
		.default("PROCEDURE"),
});

export const ddlDetailsResponseSchema = z.object({
	objectName: z.string(),
	objectType: z.enum(["PROCEDURE", "FUNCTION", "VIEW", "TABLE"]),
	ddl: z.string(),
});

export type ObjectType = z.infer<typeof ddlDetailsRequestSchema>["objectType"];
export type DdlDetailsRequest = z.infer<typeof ddlDetailsRequestSchema>;
export type DdlDetailsResponse = z.infer<typeof ddlDetailsResponseSchema>;
