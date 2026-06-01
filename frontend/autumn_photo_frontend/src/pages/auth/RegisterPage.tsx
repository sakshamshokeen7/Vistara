import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { registerUser } from "../../services/authservice";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await registerUser({
        email,
        password,
        full_name: name.trim(), 
      });

      alert(res.message);
      navigate("/verify-otp", { state: { email } });

    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        setError(data[firstKey]?.[0] || "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/18 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={30} className="text-blue-300" />
            </div>

            <h1 className="text-[28px] font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>Create Account</h1>
            <p className="text-[13px] text-neutral-600 mt-1.5">Join the autumn photography community</p>
          </div>

          {error && (
            <div className="p-3 text-[13px] text-red-300 bg-red-950/40 border border-red-900/40 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 text-neutral-600" size={16} />
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  className="input !pl-10"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-neutral-600" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !pl-10"
                  placeholder="you@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-neutral-600" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10"
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : <>Register <ArrowRight size={16} /></>}
            </button>

            <p className="text-center text-[13px] text-neutral-600 mt-6">
              Already have an account?
              <Link to="/login" className="text-blue-500 font-medium ml-1 hover:text-blue-400 transition-colors duration-150">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
