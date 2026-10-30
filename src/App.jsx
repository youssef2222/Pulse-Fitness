
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";

import { Header } from "./components/Header";
import { Container } from "./components/Container";
import { Footer } from "./components/Footer";

import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] p-10 text-center text-white">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function ProtectedLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#080808] p-10 text-white">
      <h1 className="text-3xl font-bold">
        WELCOME, {user?.full_name?.toUpperCase()}
      </h1>

      <p className="mt-4 text-gray-400">
        Welcome to your Pulse Fitness account.
      </p>
    </main>
  );
}

function AppContent() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Container />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* Unknown URLs */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
