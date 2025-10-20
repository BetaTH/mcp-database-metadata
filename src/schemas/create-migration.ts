import { z } from "zod";

export const createMigrationPromptRequestSchema = z.object({
	userInstructions: z.string().optional(),
});

export type CreateMigrationPromptRequest = z.infer<
	typeof createMigrationPromptRequestSchema
>;
