import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import type { ResolvedCccConfig } from "./config.js";

export type CccRequest = Record<string, unknown> & { cmd: string };

export type CccResponse = {
  ok: boolean;
  [key: string]: unknown;
};

export function buildSshArgv(cfg: ResolvedCccConfig): string[] {
  const argv: string[] = ["ssh"];

  // Disable pseudo-terminal, batch mode, tight timeouts
  argv.push("-o", "BatchMode=yes");
  argv.push("-o", "ConnectTimeout=10");
  argv.push("-o", "StrictHostKeyChecking=accept-new");

  if (cfg.sshPort !== 22) {
    argv.push("-p", String(cfg.sshPort));
  }
  if (cfg.sshIdentityFile) {
    argv.push("-i", cfg.sshIdentityFile);
  }

  argv.push(cfg.sshHost);

  // socketPath must be absolute (OpenClaw expands ~ against local home, not remote).
  // JSON payload arrives via stdin (passed through SSH).
  // CCC doesn't close the socket after responding, so socat would hang forever.
  // -t 300 = generous shutdown timeout (runCommandWithTimeout handles the real deadline).
  // head -n1 = grab the single-line JSON response and exit, causing SIGPIPE to kill socat.
  const remoteCmd = `socat -t 300 - UNIX-CONNECT:"${cfg.socketPath}" | head -n1`;
  argv.push(remoteCmd);

  return argv;
}

export async function execCccCommand(
  api: OpenClawPluginApi,
  cfg: ResolvedCccConfig,
  request: CccRequest,
  timeoutMs: number,
): Promise<CccResponse> {
  const jsonPayload = JSON.stringify(request);
  const argv = buildSshArgv(cfg);

  // Pass JSON via stdin instead of embedding in the command string.
  // This avoids shell escaping issues with execve-based spawn (no local shell).
  const result = await api.runtime.system.runCommandWithTimeout(argv, {
    timeoutMs,
    input: jsonPayload + "\n",
  });

  if (result.termination === "timeout") {
    throw new Error(`CCC command timed out after ${timeoutMs}ms`);
  }

  if (result.code !== 0) {
    const stderr = result.stderr.trim();
    if (stderr.includes("Permission denied")) {
      throw new Error("SSH auth failed. Check SSH keys and sshHost config.");
    }
    if (stderr.includes("No such file") || stderr.includes("Connection refused")) {
      throw new Error("CCC not reachable. Is CCC running? Check socketPath config.");
    }
    if (stderr.includes("Connection timed out") || stderr.includes("Could not resolve hostname")) {
      throw new Error(`SSH connection failed: ${stderr.split("\n")[0]}`);
    }
    throw new Error(`SSH command failed (exit ${result.code}): ${stderr || result.stdout}`);
  }

  const stdout = result.stdout.trim();
  if (!stdout) {
    throw new Error("CCC returned empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(`CCC returned invalid JSON: ${stdout.slice(0, 200)}`);
  }

  const response = parsed as CccResponse;
  if (response.ok === false) {
    const msg = typeof response.error === "string" ? response.error : JSON.stringify(response);
    throw new Error(`CCC error: ${msg}`);
  }

  return response;
}
