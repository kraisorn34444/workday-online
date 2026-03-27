// WorkDay Online 2026 — App Root
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard"; // มั่นใจว่า Import Dashboard มาแล้ว
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 1. หน้า Login: ถ้า Login แล้วให้ดีดไปหน้าแรกทันที */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>

      {/* 2. หน้า Dashboard (Root): ถ้ายังไม่ Login ให้ดีดไปหน้า Login */}
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
      </Route>

      {/* 3. หน้าอื่นๆ และหน้า 404 */}
      <Route path="/404" component={NotFound} />
      
      {/* 4. Default Route: ถ้าไม่ตรงกับอะไรเลย ให้ไปหน้า Login หรือ NotFound */}
      <Route>
        {isAuthenticated ? <NotFound /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;