import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { verifyOtp } from "../../services/authservice";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = useLocation().state?.email;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = otp.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");

  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => d === "");
    const idx = firstEmpty === -1 ? 5 : firstEmpty;
    inputsRef.current[idx]?.focus();
  }, []); 

  const handleChangeDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; 
    const next = [...digits];
    next[index] = value.slice(-1);
    const joined = next.join("");
    setOtp(joined);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = "";
      setOtp(next.join(""));
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) return;
    setOtp(pasted);
    inputsRef.current[5]?.focus();
  };

  const handleVerify = async () => {
    try {
      await verifyOtp({ email, otp });
      alert("Account verified. Now login.");
      navigate("/login");
    } catch (err: any) {
      setError("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen w-screen flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 z-0" />
        <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 blur-3xl rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-green-500 shadow-xl mx-auto mb-4">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Verify your email</h1>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-gray-700">{email || "your email"}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    if (el) inputsRef.current[i] = el;
                  }}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangeDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${i + 1}`}
                  className="w-12 h-14 text-center text-xl font-medium rounded-xl border border-gray-200 bg-white text-slate-800 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div />
              <div className="text-sm text-gray-500">Enter the code you received</div>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Verify <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Need help?{" "}
            <Link to="/support" className="text-indigo-600 font-medium ml-1 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[45%] bg-green-600 justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="text-5xl font-bold">Viora</h2>
          <p className="text-indigo-200 text-lg">Upload, explore and enjoy beautiful campus memories.</p>
        </div>
      </div>
    </div>
  );
}