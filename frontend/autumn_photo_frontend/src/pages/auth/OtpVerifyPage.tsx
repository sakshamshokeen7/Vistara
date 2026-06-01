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
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/18 mx-auto mb-6">
              <Sparkles className="text-blue-300 w-8 h-8" />
            </div>
            <h1 className="text-[28px] font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>Verify your email</h1>
            <p className="text-[13px] text-neutral-600 mt-1.5">
              Enter the 6-digit code sent to{" "}
              <span className="text-neutral-400">{email || "your email"}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-5 text-[13px] text-red-300 border border-red-900/40 bg-red-950/40 rounded-lg">
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
            <div className="flex items-center justify-center gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangeDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${i + 1}`}
                  className="w-11 h-13 text-center text-lg font-medium rounded-lg border border-white/[0.08] bg-[#0f0f0f] text-[#f5f5f5] placeholder-[#3a3a3a] focus:outline-none focus:border-blue-500/45 transition-all duration-150"
                />
              ))}
            </div>

            <div className="text-center text-[12px] text-neutral-600">Enter the code you received</div>

            <button
              type="submit"
              disabled={otp.length !== 6}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Verify <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-[13px] text-neutral-600 mt-6">
            Need help?{" "}
            <Link to="/support" className="text-blue-500 font-medium ml-1 hover:text-blue-400 transition-colors duration-150">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
