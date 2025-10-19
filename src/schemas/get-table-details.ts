import { z } from "zod";

export const tableDetailsRequestSchema = z.object({
	connectionName: z.string(),
	tableName: z.string(),
});

export const columnInfoSchema = z.object({
	name: z.string(),
	type: z.string(),
	nullable: z.boolean(),
	default: z.string().nullable(),
	primary_key: z.boolean(),
});

export const constraintInfoSchema = z.object({
	name: z.string().optional(),
	columns: z.array(z.string()),
	referred_table: z.string().optional(),
	referred_columns: z.array(z.string()).optional(),
});

export const indexInfoSchema = z.object({
	name: z.string(),
	columns: z.array(z.string()),
	unique: z.boolean(),
});

export const triggerInfoSchema = z.object({
	name: z.string(),
	event_manipulation: z.string(),
	action_timing: z.string(),
	action_statement: z.string(),
});

export const tableDetailsResponseSchema = z.object({
	tableName: z.string(),
	columns: z.array(columnInfoSchema),
	primaryKeyConstraint: constraintInfoSchema.optional(),
	foreignKeyConstraints: z.array(constraintInfoSchema),
	indexes: z.array(indexInfoSchema),
	triggers: z.array(triggerInfoSchema),
});

export type TableDetailsRequest = z.infer<typeof tableDetailsRequestSchema>;
export type ColumnInfo = z.infer<typeof columnInfoSchema>;
export type ConstraintInfo = z.infer<typeof constraintInfoSchema>;
export type IndexInfo = z.infer<typeof indexInfoSchema>;
export type TriggerInfo = z.infer<typeof triggerInfoSchema>;
export type TableDetailsResponse = z.infer<typeof tableDetailsResponseSchema>;
