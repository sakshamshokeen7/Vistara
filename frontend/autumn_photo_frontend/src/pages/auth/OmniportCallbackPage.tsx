import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import axios from "../../services/axiosinstances";

export default function OmniportCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const finalizeLogin = async () => {
      try {
        const res = await axios.get("/accounts/omniport/session/");

        const { access, refresh, email, role } = res.data;

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        dispatch(loginSuccess({ access, refresh, email, role }));

        navigate("/events");
      } catch (err) {
        console.error("Omniport session failed", err);
        localStorage.clear();
        navigate("/login");
      }
    };

    finalizeLogin();
  }, []);

  return <div className="min-h-screen w-screen bg-[#0a0a0a] flex items-center justify-center text-[#f5f5f5]"><div className="text-center">Logging you in…</div></div>;
}
