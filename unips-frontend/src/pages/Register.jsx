import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Logo from "../components/Logo";
import gaintlogo from "../images/gaintlogo.png";
import { registerUser } from "../services/authService";
import { isAuthenticated } from "../services/session";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccess("Account created. You can sign in now.");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (registerError) {
      const detail = registerError.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg
        : detail ?? "Registration failed. Please check the form and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <div className="flex w-full bg-white px-8 py-8 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="relative flex min-h-screen w-full flex-col">
          <div className="pt-4">
            <Logo />
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[480px] animate-fade-in-up">
              <h2 className="mb-2 text-4xl font-bold leading-[1.15] text-slate-900">
                Create Account
              </h2>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <InputField
                  label="Full Name"
                  type="text"
                  name="fullName"
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="name@org.gov"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/">
                  Sign in
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
        <div className="relative px-10 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">UNIPS</h2>
          <p className="mx-auto max-w-sm leading-relaxed text-slate-400">
            Secure access for monitoring, prediction, and reporting workflows.
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

export default Register;
