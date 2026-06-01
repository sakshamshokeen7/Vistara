import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "../services/axiosinstances";
import { setRole } from "../features/auth/authSlice";
import NotificationBell from "../components/notificationbell";
import { LogOut, LayoutDashboard, User } from "lucide-react";

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
    <nav className="sticky top-0 z-10 w-full bg-[#0a0a0a] border-b border-white/[0.06] h-[58px] px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/events" className="text-[17px] font-normal text-[#f5f5f5] transition-colors duration-150 hover:text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Autumn Photo
        </Link>
      </div>

      <div className="flex items-center gap-3">
  {isAuth && (
    <>
      {/* 🔔 Notifications */}
      <NotificationBell />

      {roleVal === 'ADMIN' && (
        <Link 
          to="/admin" 
          className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-neutral-500 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 flex items-center justify-center transition-all duration-150"
          title="Admin"
        >
          <LayoutDashboard size={16} />
        </Link>
      )}

      {roleVal === 'PHOTOGRAPHER' && (
        <Link 
          to="/photographer" 
          className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-neutral-500 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 flex items-center justify-center transition-all duration-150"
          title="Photographer Dashboard"
        >
          <LayoutDashboard size={16} />
        </Link>
      )}

      <Link 
        to="/profile" 
        className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-neutral-500 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 flex items-center justify-center transition-all duration-150"
        title="Profile"
      >
        <User size={16} />
      </Link>

      <button 
        onClick={logout} 
        className="text-[13px] font-medium text-neutral-300 border border-white/[0.10] px-4 py-1.5 rounded-lg hover:text-white hover:border-white/[0.20] hover:bg-white/[0.04] transition-all duration-150 flex items-center gap-2"
      >
        <LogOut size={14} />
        <span>Logout</span>
      </button>
    </>
  )}

  {!isAuth && (
    <Link 
      to="/login" 
      className="text-[13px] font-medium text-white bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-lg transition-all duration-150"
    >
      Login
    </Link>
  )}
</div>

    </nav>
  );
}
