import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import InputField from "../components/InputField";
import gaintlogo from "../images/gaintlogo.png";
import { loginUser } from "../services/authService";
import { isAuthenticated } from "../services/session";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await loginUser(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      const message =
        loginError.response?.data?.detail ??
        "Login failed. Please check your email and password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <div className="flex w-full bg-white px-8 py-8 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="relative flex h-screen w-full flex-col">
          <div className="pt-4">
            <Logo />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[480px] animate-fade-in-up">
              <h2 className="mb-2 text-4xl font-bold leading-[1.15] text-slate-900">
                Sign In
              </h2>
              <p className="mb-8 text-sm leading-6 text-slate-500">
              </p>
              <br/>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="name@org.gov"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                {error && (
                  <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}
                <br/>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:from-teal-700 hover:to-teal-800 active:scale-[0.99]"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                Authorized personnel only. Access is monitored and logged.
              </p>
              <p className="mt-4 text-center text-sm text-slate-500">
                Need an account?{" "}
                <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/register">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-black lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-teal-700/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative px-10 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">UNIPS</h2>
          <p className="mx-auto max-w-sm leading-relaxed text-slate-400">
            Real-time monitoring, prediction, and reporting for urban noise
            management.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            powered by
          </p>
          <img src={gaintlogo} alt="gaint" className="w-[200px] object-contain opacity-90" />
        </div>
      </div>
    </div>
  );
}

export default Login;
