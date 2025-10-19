import { z } from "zod";

export const createMigrationPromptRequestSchema = z.object({
	userInstructions: z.string(),
});

export type CreateMigrationPromptRequest = z.infer<
	typeof createMigrationPromptRequestSchema
>;
