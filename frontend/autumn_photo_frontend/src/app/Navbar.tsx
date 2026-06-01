import { useEffect } from "react";
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
    <nav className="w-full bg-slate-900 text-white p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/events" className="text-xl font-bold">Events</Link>
      </div>

      <div className="flex items-center gap-3">
  {isAuth && (
    <>
      {/* 🔔 Notifications */}
      <NotificationBell />

      {roleVal === 'ADMIN' && (
        <Link to="/admin" className="px-3 py-1 bg-black-600 rounded">
          Admin
        </Link>
      )}

      {roleVal === 'PHOTOGRAPHER' && (
        <Link to="/photographer" className="px-3 py-1 bg-black-600 rounded">
          Photographer Dashboard
        </Link>
      )}

      <Link to="/profile" className="px-3 py-1 bg-black-600 rounded text-white">
        Profile
      </Link>

      <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">
        Logout
      </button>
    </>
  )}

  {!isAuth && (
    <Link to="/login" className="px-3 py-1 bg-indigo-600 rounded">
      Login
    </Link>
  )}
</div>

    </nav>
  );
}
