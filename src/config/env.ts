export function cleanEnvValue(
  value: string | null | undefined,
): string | undefined {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return undefined;
  }

  const first = cleanValue[0];
  const last = cleanValue[cleanValue.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return cleanValue.slice(1, -1);
  }

  return cleanValue;
}

export function getEnv(name: string): string | undefined {
  return cleanEnvValue(process.env[name]);
}

export function getRequiredEnv(
  name: string,
  value: string | null | undefined = process.env[name],
): string {
  const cleanValue = cleanEnvValue(value);

  if (!cleanValue) {
    throw new Error(
      `Missing required environment variable ${name}. Set ${name} before starting the application.`,
    );
  }

  return cleanValue;
}

export function getBooleanEnv(name: string): boolean {
  return ['1', 'true', 'yes'].includes(getEnv(name)?.toLowerCase() ?? '');
}

export function normalizeDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get('sslmode')?.toLowerCase();

    if (sslMode && ['prefer', 'require', 'verify-ca'].includes(sslMode)) {
      url.searchParams.set('sslmode', 'verify-full');
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}
