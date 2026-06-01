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
    <div className="h-screen w-screen flex overflow-hidden bg-dark-page">
      <div className="flex-1 flex items-center justify-center p-6 relative">

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-xl mx-auto mb-6">
              <Sparkles className="text-blue-500 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-neutral-400 text-sm">Login to continue</p>
          </div>
          {error && (
            <div className="p-4 mb-5 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-xl">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-400"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <input type="checkbox" className="rounded border border-neutral-600 bg-neutral-800 checked:bg-blue-500 checked:border-blue-500" /> Remember Me
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={18}/></>}
            </button>
            <div className="mt-4">
  <a
    href="http://localhost:8000/api/accounts/omniport/login/"
    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-900 hover:border-blue-500/30 transition"
  >
    <img
      src={omniportLogo}
      alt="Omniport"
      className="w-6 h-6"
    />
    <span className="font-medium text-sm">Continue with Omniport</span>
  </a>
</div>


          </form>
          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?
            <Link to="/register" className="text-blue-500 font-medium ml-1 hover:text-blue-400">
              Register
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 to-blue-700 justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="text-5xl font-serif font-bold">Viora</h2>
          <p className="text-blue-100 text-lg">
            Upload, explore and enjoy beautiful campus memories.
          </p>
        </div>
      </div>
    </div>
  );
}
