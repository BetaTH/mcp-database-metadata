import { z } from "zod";

export const procedureDetailsRequestSchema = z.object({
	connectionName: z.string(),
	procedureName: z.string(),
	routineType: z.enum(["PROCEDURE", "FUNCTION"]).default("PROCEDURE"),
});

export const procedureDetailsResponseSchema = z.object({
	procedureName: z.string(),
	routineType: z.enum(["PROCEDURE", "FUNCTION"]),
	ddl: z.string(),
});

export type RoutineType = z.infer<
	typeof procedureDetailsRequestSchema
>["routineType"];
export type ProcedureDetailsRequest = z.infer<
	typeof procedureDetailsRequestSchema
>;
export type ProcedureDetailsResponse = z.infer<
	typeof procedureDetailsResponseSchema
>;
