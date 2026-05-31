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
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0a0a]">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 mx-auto mb-6">
              <Sparkles className="text-blue-500 w-7 h-7" />
            </div>
            <h1 className="font-serif text-4xl font-normal text-white mb-2">Create Account</h1>
            <p className="font-sans text-sm text-neutral-400">Join the autumn photography community</p>
          </div>

          {error && (
            <div className="p-4 mb-5 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-11 w-full"
                  placeholder="Full name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11 w-full"
                  placeholder="Email"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 w-full"
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? "Creating..." : <>Register <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-8">
            Already have an account?
            <Link to="/login" className="text-blue-500 font-medium ml-1 hover:text-blue-400 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 to-blue-700 justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white blur-3xl rounded-full" />
        </div>
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="font-serif text-5xl font-normal text-white">Join Viora</h2>
          <p className="font-sans text-blue-100 text-lg">
            Register, upload & relive the best college memories.
          </p>
        </div>
      </div>
    </div>
  );
}