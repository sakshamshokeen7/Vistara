import { useEffect, useState } from "react";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import { Search } from "lucide-react";

const GalleryPage = () => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPhotos = async (query = "") => {
        setLoading(true);
        try {
            const res = await axios.get(`/photos/search/?q=${encodeURIComponent(query)}`);
            setPhotos(res.data?.photos || []);
        } catch (e) {
            console.error(e);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos("");
    }, []);

    const handleSearch = () => {
        fetchPhotos(searchQuery);
    };

    return (
        <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
            <Navbar />
            <div className="px-6 md:px-10 lg:px-16 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-[40px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Global Gallery</h1>
                    
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-white/[0.1] rounded-xl leading-5 bg-[#111111] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1a1a1a] focus:border-blue-500/50 sm:text-sm transition-colors duration-200"
                            placeholder="Search by tag, person, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-gray-400">Loading gallery...</div>
                ) : photos.length ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {photos.map((p: any) => (
                            <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="gallery item" className="w-full h-48 md:h-64 object-cover rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400">No photos found matching your search.</div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
