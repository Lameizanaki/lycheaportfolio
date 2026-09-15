import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { fetchSession } from "../lib/api";
import { hasAdminSessionHint } from "../lib/adminSession";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">(() =>
    hasAdminSessionHint() ? "authenticated" : "checking",
  );

  useEffect(() => {
    let cancelled = false;

    fetchSession()
      .then((authenticated) => {
        if (!cancelled) setStatus(authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!cancelled && !hasAdminSessionHint()) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="admin-shell admin-shell--centered">
        <p>Checking session…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
