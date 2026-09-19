import fs from 'node:fs'
import os from 'node:os'


// Loads .env if present (Node >= 21 has this built in), then exposes typed config.
try {
    process.loadEnvFile();


} catch {
    // No .env file — rely on the actual environment.
}


export type LocalConfig = {
    artifactsToken?: string,
}

let localConfig: LocalConfig = {}
try {
    localConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.config/artifacts_mmo/config.json`, 'utf8'));

} catch {

}

export const config = {
    artifactsToken: localConfig.artifactsToken ?? '',
    port: Number(process.env.PORT ?? 3000),
} as const;
