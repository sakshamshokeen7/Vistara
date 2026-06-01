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
    <div className="h-screen w-screen flex overflow-hidden bg-dark-page">
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md space-y-5"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-xl mx-auto mb-6">
              <Sparkles className="text-blue-500 w-8 h-8" />
            </div>

            <h1 className="text-4xl font-serif font-bold text-white mb-2">Create Account</h1>
            <p className="text-neutral-400 text-sm">Join the autumn photography community</p>
          </div>

          {error && (
            <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Full Name</label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="input-field w-full pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
                className="input-field w-full pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="input-field w-full pl-11"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
          >
            {loading ? "Creating..." : <>Register <ArrowRight size={18} /></>}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?
            <Link to="/login" className="text-blue-500 font-medium ml-1 hover:text-blue-400">
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-green-600 to-green-700 justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="text-5xl font-serif font-bold">Join Viora</h2>
          <p className="text-green-100 text-lg">
            Register, upload & relive the best college memories.
          </p>
        </div>
      </div>
    </div>
  );
}