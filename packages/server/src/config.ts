// Loads .env if present (Node >= 21 has this built in), then exposes typed config.
try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on the actual environment.
}

export const config = {
  artifactsToken: process.env.ARTIFACTSMMO_TOKEN ?? '',
  port: Number(process.env.PORT ?? 3000),
} as const;
