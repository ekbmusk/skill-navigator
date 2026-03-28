import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";

const DiagnosticsPage = lazy(() => import("./pages/DiagnosticsPage"));
const PhysicsDiagnosticsPage = lazy(() => import("./pages/PhysicsDiagnosticsPage"));
const InfoCommDiagnosticsPage = lazy(() => import("./pages/InfoCommDiagnosticsPage"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const CasesListPage = lazy(() => import("./pages/CasesListPage"));
const CasePage = lazy(() => import("./pages/CasePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const TestsListPage = lazy(() => import("./pages/TestsListPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/tests" element={
                <ProtectedRoute>
                  <TestsListPage />
                </ProtectedRoute>
              } />
              <Route path="/diagnostics" element={
                <ProtectedRoute>
                  <DiagnosticsPage />
                </ProtectedRoute>
              } />
              <Route path="/diagnostics/physics" element={
                <ProtectedRoute>
                  <PhysicsDiagnosticsPage />
                </ProtectedRoute>
              } />
              <Route path="/diagnostics/infocomm" element={
                <ProtectedRoute>
                  <InfoCommDiagnosticsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cases" element={
                <ProtectedRoute>
                  <CasesListPage />
                </ProtectedRoute>
              } />
              <Route path="/case/:id" element={
                <ProtectedRoute>
                  <CasePage />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
