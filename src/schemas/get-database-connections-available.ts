import z from "zod";

export const getDatabaseConnectionsAvailableResponse = z.object({
	databases: z.array(z.string()),
});
