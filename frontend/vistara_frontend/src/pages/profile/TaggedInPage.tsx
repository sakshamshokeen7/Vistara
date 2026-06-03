import { useEffect, useState } from "react";
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

const TaggedInPage = () => {
    const [tagged, setTagged] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const taggedData = await tryGet([
                "/photos/my/tagged/",
                "/photos/tagged/",
                "/photos/user/tagged/",
            ]);
            setTagged(taggedData?.photos || taggedData || []);
            setLoading(false);
        })();
    }, []);

    return (
        <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
            <Navbar />
            <div className="px-6 md:px-10 lg:px-16 py-10">
                <h1 className="text-[40px] font-normal mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Tagged In</h1>
                {loading ? (
                    <div className="text-gray-400">Loading...</div>
                ) : tagged.length ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {tagged.map((p: any) => (
                            <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-48 md:h-64 object-cover rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400">No tags found.</div>
                )}
            </div>
        </div>
    );
};

export default TaggedInPage;
