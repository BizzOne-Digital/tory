import { Suspense } from "react";
import AdminLoginPage from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
