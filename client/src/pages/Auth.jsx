import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login, signup, saveSession } from "../api/auth";
import "../style/Auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PERKS = ["Free to try", "No credit card required", "5 analyses per day"];

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? "bad" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input type={show ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (isSignup && form.name.trim().length < 2) e.name = "Enter your name";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (isSignup) {
      if (form.password.length < 8 || !/[a-z]/i.test(form.password) || !/\d/.test(form.password))
        e.password = "Use at least 8 characters, with a letter and a number";
      if (!form.terms) e.terms = "Accept the terms to continue";
    } else if (!form.password) e.password = "Enter your password";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError("");
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const data = isSignup ? await signup(form.name.trim(), email, form.password) : await login(email, form.password);
      saveSession(data);
      navigate(location.state?.from || "/app", { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-form-side">
        <Link to="/" className="auth-logo" aria-label="RankFlux home">
          <svg width="34" height="34" viewBox="0 0 44 44" fill="none"><defs><linearGradient id="ag" x1="6" y1="40" x2="38" y2="4"><stop stopColor="#2f6bff" /><stop offset="1" stopColor="#7c5cff" /></linearGradient></defs><path d="M22 4 40 40H29L22 25 15 40H4z" fill="url(#ag)" /><path d="M22 4l8 17-8 6z" fill="#fff" opacity=".9" /></svg>
          <span>Rank<b>Flux</b></span>
        </Link>

        <form className="auth-box" onSubmit={submit} noValidate>
          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-sub">{isSignup ? "Start tracking your search traffic in minutes." : "Log in to continue to your dashboard."}</p>

          {serverError && <div className="server-err" role="alert">{serverError}</div>}

          {isSignup && (
            <Field label="Full name" error={errors.name}>
              <input type="text" value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your name" />
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput value={form.password} onChange={set("password")} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Your password"} />
          </Field>

          {isSignup ? (
            <label className={`check ${errors.terms ? "bad" : ""}`}>
              <input type="checkbox" checked={form.terms} onChange={set("terms")} />
              <span>I agree to the <a href="#">Terms of service</a> and <a href="#">Privacy policy</a></span>
            </label>
          ) : (
            <a className="forgot" href="#">Forgot password?</a>
          )}
          {errors.terms && <small className="check-err" role="alert">{errors.terms}</small>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="btn-spin" /> : isSignup ? "Create account" : "Log in"}
          </button>

          <p className="switch">
            {isSignup ? "Already have an account?" : "New to RankFlux?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link>
          </p>
        </form>
      </section>

      <aside className="auth-brand" aria-hidden="true">
        <div>
          <h2>Turn search data into your next growth move.</h2>
          <p>Track rankings, analyze competitors, audit your website, and get AI-powered insights.</p>
          <ul>{PERKS.map((p) => <li key={p}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>{p}</li>)}</ul>
        </div>
      </aside>
    </div>
  );
}

export const Login = () => <AuthPage mode="login" />;
export const Signup = () => <AuthPage mode="signup" />;