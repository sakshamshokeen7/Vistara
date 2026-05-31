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
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0a0a]">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 mx-auto mb-6">
              <Sparkles className="text-blue-500 w-7 h-7" />
            </div>
            <h1 className="font-serif text-4xl font-normal text-white mb-2">Welcome Back</h1>
            <p className="font-sans text-sm text-neutral-400">Login to continue</p>
          </div>
          {error && (
            <div className="p-4 mb-5 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
              <input type="checkbox" className="rounded border border-blue-500/30 bg-blue-500/5 checked:bg-blue-500 checked:border-blue-500 w-4 h-4" /> Remember Me
            </label>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={18}/></>}
            </button>
            <div className="mt-5">
              <a
                href="http://localhost:8000/api/accounts/omniport/login/"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.05] hover:border-blue-500/25 transition-all duration-150 font-sans text-sm"
              >
                <img
                  src={omniportLogo}
                  alt="Omniport"
                  className="w-5 h-5"
                />
                <span>Continue with Omniport</span>
              </a>
            </div>
          </form>
          <p className="text-center text-sm text-neutral-500 mt-8">
            Don't have an account?
            <Link to="/register" className="text-blue-500 font-medium ml-1 hover:text-blue-400 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 to-blue-700 justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white blur-3xl rounded-full" />
        </div>
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="font-serif text-5xl font-normal text-white">Viora</h2>
          <p className="font-sans text-blue-100 text-lg">
            Upload, explore and enjoy beautiful campus memories.
          </p>
        </div>
      </div>
    </div>
  );
}
