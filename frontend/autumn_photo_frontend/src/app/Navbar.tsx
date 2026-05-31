import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "../services/axiosinstances";
import { setRole } from "../features/auth/authSlice";
import NotificationBell from "../components/notificationbell";

export default function Navbar() {
  const isAuth = useSelector((state:any) => state.auth.isAuthenticated);
  const roleFromState = useSelector((state:any) => state.auth.role);
  const role = roleFromState || localStorage.getItem("role");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    try { dispatch({ type: "auth/logout" }); } catch(e){}
    navigate("/login");
  };

  useEffect(() => {
    if (isAuth && !role) {
      (async () => {
        try {
          const res = await axios.get('/accounts/me/');
          const data = res.data || {};
          let r = data.role;
          if (!r && data.is_superuser) r = 'ADMIN';
          if (r) dispatch(setRole(r));
        } catch (e) {
        }
      })();
    }
  }, [isAuth, role]);

  const roleVal = (role || '').toString().trim().toUpperCase();

  return (
    <nav className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/[0.06] h-[58px] px-7 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/events" className="font-serif text-[17px] font-normal text-[#f5f5f5] hover:text-white transition-colors">
          Autumn Photo
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/events" className="font-sans text-sm text-neutral-500 hover:text-white hover:bg-white/[0.05] px-3 py-1.5 rounded-md transition-all duration-150">
            Events
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuth && (
          <>
            {/* 🔔 Notifications */}
            <NotificationBell />

            {roleVal === 'ADMIN' && (
              <Link to="/admin" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 transition-all duration-150 text-sm">
                A
              </Link>
            )}

            {roleVal === 'PHOTOGRAPHER' && (
              <Link to="/photographer" title="Photographer Dashboard" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 transition-all duration-150 text-sm">
                P
              </Link>
            )}

            <Link to="/profile" title="Profile" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 transition-all duration-150 text-sm">
              👤
            </Link>

            <button 
              onClick={logout} 
              className="font-sans text-xs text-neutral-500 border border-white/10 hover:bg-white/[0.05] hover:border-white/20 px-4 py-1.5 rounded-lg transition-all duration-150"
            >
              Logout
            </button>
          </>
        )}

        {!isAuth && (
          <Link to="/login" className="font-sans text-xs bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg transition-all duration-150">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
