import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
