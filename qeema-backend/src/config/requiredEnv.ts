/** Fail fast when required env vars are missing (after `dotenv/config`). */
export function assertRequiredEnv(): void {
  if (!process.env["SECRET_KEY"]?.trim()) {
    console.error(
      "[env] SECRET_KEY is missing or empty. Add it to .env — a long random string used to sign JWTs (e.g. run: openssl rand -hex 32)."
    );
    process.exit(1);
  }
}
