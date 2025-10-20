import { z } from "zod";

// Esquema para a configuração do banco de dados
const databaseConnectionsConfigSchema = z
	.array(
		z.object({
			connectionName: z.string(),
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
	databaseConnections: databaseConnectionsConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
export type DatabaseConnections = z.infer<
	typeof databaseConnectionsConfigSchema
>;
