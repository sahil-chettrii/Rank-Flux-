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
import { Login, Signup } from "./pages/Auth";

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
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/app" element={<DashboardLayout theme={theme} onToggleTheme={toggleTheme} />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        {NAV.filter((n) => n.path !== "overview").map((n) => (
          <Route key={n.path} path={n.path} element={<FeaturePage item={n} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}