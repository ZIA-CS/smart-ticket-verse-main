import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: JSX.Element;
  requireRole?: AppRole[];
}) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireRole && !requireRole.some((r) => roles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
