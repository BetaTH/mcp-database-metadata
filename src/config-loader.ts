import path from 'path';
import fs from 'fs';
import os from 'os';
import { z } from 'zod';
import { Config, configSchema } from './schemas/config';

const CWD = process.cwd();
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.mcp-database-metadata');
const GLOBAL_CONFIG_PATH = path.join(GLOBAL_CONFIG_DIR, 'settings.json');
const LOCAL_CONFIG_PATH = path.join(CWD, 'mcp-database-metadata.settings.json');

function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = target[key];
            if (isObject(sourceValue) && targetValue && isObject(targetValue)) {
                output[key] = deepMerge(targetValue, sourceValue);
            } else {
                output[key] = sourceValue;
            }
        });
    }
    return output;
}

function readConfigFile(filePath: string): Partial<Config> | undefined {
    if (!fs.existsSync(filePath)) {
        return undefined;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.warn(`Aviso: Erro ao ler ou parsear o arquivo de configuração: ${filePath}`);
        return undefined;
    }
}

export function loadConfiguration(cliPath?: string): Config | undefined {
    let cliConfig: Partial<Config> | undefined;
    if (cliPath) {
        cliConfig = readConfigFile(path.resolve(CWD, cliPath));
    }
    const localConfig = readConfigFile(LOCAL_CONFIG_PATH);
    const globalConfig = readConfigFile(GLOBAL_CONFIG_PATH);

    let mergedConfig: Partial<Config> = {};
    if (globalConfig) {
        mergedConfig = deepMerge(mergedConfig, globalConfig);
    }
    if (localConfig) {
        mergedConfig = deepMerge(mergedConfig, localConfig);
    }
    if (cliConfig) {
        mergedConfig = deepMerge(mergedConfig, cliConfig);
    }

    if (Object.keys(mergedConfig).length === 0) {
        console.warn("Aviso: Nenhuma configuração encontrada ou todas as configurações são inválidas. As ferramentas que dependem de configuração não serão registradas.");
        return undefined;
    }

    try {
        const validatedConfig = configSchema.parse(mergedConfig);
        console.log("Configuração carregada e validada com sucesso.");
        return validatedConfig;
    } catch (error) {
        console.warn("Aviso: A configuração final mesclada é inválida. As ferramentas que dependem de configuração não serão registradas.");
        if (error instanceof z.ZodError) {
            console.warn("Detalhes do erro de validação:");
            error.errors.forEach((err) => {
                console.warn(`- Campo '${err.path.join(".")}': ${err.message}`);
            });
        }
        return undefined;
    }
}
