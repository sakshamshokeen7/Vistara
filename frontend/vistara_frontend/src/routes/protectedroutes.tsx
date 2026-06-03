import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuth = useSelector((state:any) => state.auth.isAuthenticated);
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}
