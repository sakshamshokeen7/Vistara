import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";

const tryGet = async (urls: string[]) => {
    for (const u of urls) {
        try {
            const res = await axios.get(u);
            return res.data;
        } catch (e: any) {
            if (!e.response || e.response.status !== 404) {
                console.error(e);
            }
        }
    }
    return null;
};

const ProfilePage = () => {
    const email = useSelector((s: any) => s.auth.email);
    const [full_name, setFullName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [liked, setLiked] = useState<any[]>([]);
    const [favs, setFavs] = useState<any[]>([]);
    const [tagged, setTagged] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const likedData = await tryGet([
                "/photos/my/likes/",
                "/photos/likes/",
                "/photos/user/likes/",
            ]);
            setLiked(likedData?.photos || likedData || []);

            const favData = await tryGet([
                "/photos/my/favourites/",
                "/photos/favourites/",
                "/photos/user/favourites/",
            ]);
            setFavs(favData?.photos || favData || []);

            const taggedData = await tryGet([
                "/photos/my/tagged/",
                "/photos/tagged/",
                "/photos/user/tagged/",
            ]);
            setTagged(taggedData?.photos || taggedData || []);
            
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
    }, []);

    return (
        <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
            <Navbar />
            <div className="px-6 md:px-10 lg:px-16 py-10">
                <h1 className="text-[40px] font-normal mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Profile</h1>
                <div className="mb-10 p-6 rounded-xl bg-[#111111] border border-white/[0.07]">
                    <div className="text-[15px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Username: <span className="text-neutral-400">{full_name|| 'Unknown'}</span></div>
                    <div className="text-[15px] font-normal mt-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Email: <span className="text-neutral-400">{email || 'Unknown'}</span></div>
                    <div className="text-[15px] font-normal mt-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Role: <span className="text-neutral-400">{role || localStorage.getItem('role') || 'USER'}</span></div>
                </div>

                <section className="mb-10">
                    <h2 className="text-[20px] font-normal mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>Liked Photos</h2>
                    {liked.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {liked.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No liked photos (or endpoint not available).</div>
                    )}
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Favourites</h2>
                    {favs.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {favs.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No favourites (or endpoint not available).</div>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Tagged In</h2>
                    {tagged.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tagged.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No tags (or endpoint not available).</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;