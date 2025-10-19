import z from "zod";

export const getDatabasesAvailableResponse = z.object({
	databases: z.array(z.string()),
});
