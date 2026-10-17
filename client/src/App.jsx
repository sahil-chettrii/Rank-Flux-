import { Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import useTheme from "./hooks/useTheme";
import { NAV } from "./config/nav";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Results from "./components/Results";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Overview from "./pages/Overview";
import FeaturePage from "./pages/FeaturePage";
import SiteAudit from "./pages/SiteAudit";
import RankTracker from "./pages/RankTracker";
import { Login, Signup } from "./pages/Auth";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const withNavbar = (page, extra = null) => (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      {page}
      {extra}
    </>
  );

  return (
    <Routes>
      <Route path="/" element={withNavbar(
          <>
            <Hero onAnalyze={(u) => navigate(`/analyze?url=${encodeURIComponent(u)}`)} />
            <CTA />
          </>,
          <Footer />
        )} />
      <Route
        path="/analyze"
        element={withNavbar(
          params.get("url") ? <Results url={params.get("url")} onBack={() => navigate("/")} /> : <Navigate to="/" replace />,
          <Footer />
        )}
      />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/app" element={
          <ProtectedRoute>
            <DashboardLayout theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="audit" element={<SiteAudit />} />
        <Route path="rank-tracker" element={<RankTracker />} />
        {NAV.filter((n) => !["overview", "audit", "rank-tracker"].includes(n.path)).map((n) => (
          <Route key={n.path} path={n.path} element={<FeaturePage item={n} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}