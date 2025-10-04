import type { TiDBConfigStatus } from "./types";

const REQUIRED_ENV_VARS = ["TIDB_HOST", "TIDB_PORT", "TIDB_USER"] as const;

export function getTiDBConfigStatus(): TiDBConfigStatus {
  const missing: string[] = REQUIRED_ENV_VARS.filter(
    (name) => (process.env[name] || "").trim() === "",
  );
  if (
    !(
      (process.env.TIDB_DATABASE || "").trim() ||
      (process.env.TIDB_DB || "").trim()
    )
  ) {
    missing.push("TIDB_DATABASE");
  }

  let details: string | undefined;
  let ok = missing.length === 0;
  if (!ok) {
    details = `Faltan variables de entorno de TiDB: ${missing.join(", ")}`;
  } else {
    try {
      // Using require avoids eagerly loading the driver during module evaluation,
      // so deployments without mysql2 (or without native bindings) can surface a
      // readable configuration error inside the dashboard instead of crashing.
      // eslint-disable-next-line global-require
      require("mysql2/promise");
    } catch (error) {
      ok = false;
      const message = error instanceof Error ? error.message : String(error);
      details = `No se pudo cargar el driver mysql2: ${message}`;
    }
  }

  return { ok, missing, details };
}

export function assertTiDBConfig(): void {
  const status = getTiDBConfigStatus();
  if (!status.ok) {
    throw new Error(status.details || "TiDB environment is not configured");
  }
}
