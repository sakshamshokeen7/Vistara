import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authservice";
import { loginSuccess } from "../../features/auth/authSlice";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import omniportLogo from "./omniport.png"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser({ email, password });
      dispatch(loginSuccess(res)); 
      navigate("/events");     
    } 
    catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/18 mx-auto mb-6">
              <Sparkles className="text-blue-300 w-8 h-8" />
            </div>
            <h1 className="text-[28px] font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>Welcome Back</h1>
            <p className="text-[13px] text-neutral-600 mt-1.5">Login to continue</p>
          </div>
          {error && (
            <div className="p-3 mb-5 text-[13px] text-red-300 border border-red-900/40 bg-red-950/40 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-neutral-600" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-neutral-600" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-neutral-600 hover:text-neutral-300 transition-colors duration-150"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border border-white/[0.07] bg-[#0f0f0f] cursor-pointer accent-blue-500" /> 
              <label htmlFor="remember" className="text-[13px] text-neutral-500 cursor-pointer">Remember Me</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={16}/></>}
            </button>
            <div className="mt-4">
              <a
                href="http://localhost:8000/api/accounts/omniport/login/"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-white/[0.08] bg-transparent text-neutral-400 hover:text-white hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-150"
              >
                <img
                  src={omniportLogo}
                  alt="Omniport"
                  className="w-5 h-5"
                />
                <span className="text-[13px] font-medium">Continue with Omniport</span>
              </a>
            </div>
          </form>
          <p className="text-center text-[13px] text-neutral-600 mt-6">
            Don't have an account?
            <Link to="/register" className="text-blue-500 font-medium ml-1 hover:text-blue-400 transition-colors duration-150">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
