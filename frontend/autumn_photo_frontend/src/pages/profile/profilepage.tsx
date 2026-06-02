import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";

const ProfilePage = () => {
    const email = useSelector((s: any) => s.auth.email);
    const [full_name, setFullName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('/accounts/me/');
                const data = res.data;
                if (data?.full_name) setFullName(data.full_name);
                else setFullName(data.email);
                if (data?.role) setRole(data.role);
                else if (data?.is_superuser) setRole('ADMIN');
            } catch (e) {
                const maybeFull = localStorage.getItem("full_name") || null;
                if (maybeFull) setFullName(maybeFull);
                else if (email) setFullName(email.split("@")[0]);
            }
        })();
    }, [email]);

    return (
        <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
            <Navbar />
            <div className="px-6 md:px-10 lg:px-16 py-10">
                <h1 className="text-[40px] font-normal mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Profile</h1>
                <div className="mb-10 p-6 rounded-xl bg-[#111111] border border-white/[0.07]">
                    <div className="text-[15px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Username: <span className="text-neutral-400">{full_name || 'Unknown'}</span></div>
                    <div className="text-[15px] font-normal mt-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Email: <span className="text-neutral-400">{email || 'Unknown'}</span></div>
                    <div className="text-[15px] font-normal mt-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Role: <span className="text-neutral-400">{role || localStorage.getItem('role') || 'USER'}</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;