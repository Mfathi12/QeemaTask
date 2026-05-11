import { type FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";

export function LoginPage() {
  const { login, loading, token, user } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (token && user?.role === "ADMIN") {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Signed in successfully.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Check your credentials.";
      toast.error(msg);
    }
  }

  return (
    <div className="flex min-h-svh flex-col justify-center bg-[var(--bg)] px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Qeema Console
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
            Sign in
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
            Administrator access for service operations and live monitoring.
          </p>
        </div>

        <Card className="px-6 py-5 sm:py-6">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Continue"}
            </Button>
          </form>
        </Card>

        <p className="mt-10 text-center text-[11px] text-[var(--text-muted)]">
          Protected environment. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
