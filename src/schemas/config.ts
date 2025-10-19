import { z } from "zod";

// Esquema para a configuração do banco de dados
const databasesConfigSchema = z
	.array(
		z.object({
			name: z.string(),
			config: z.object({
				client: z.string(),
				connection: z.object({
					host: z.string(),
					port: z.number().positive(),
					user: z.string(),
					password: z.string(),
					database: z.string(),
				}),
			}),
		}),
	)
	.describe("Configurações para conexão com o banco de dados");

export const configSchema = z.object({
	databases: databasesConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
export type DatabasesConfig = z.infer<typeof databasesConfigSchema>;
