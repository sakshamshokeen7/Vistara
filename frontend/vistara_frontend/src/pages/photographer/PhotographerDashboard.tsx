import React, { useEffect, useState } from 'react';
import Navbar from '../../app/Navbar';
import axios from '../../services/axiosinstances';
import { getMediaUrl } from '../../utils/media';
import MultiUploader from '../../components/MultiUploader';

export default function PhotographerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);

  const load = async () => {
    try {
      const s = await axios.get('/dashboard/stats/');
      setStats(s.data);
    } catch (e) {}

    try {
      const u = await axios.get('/dashboard/uploads/');
      const data = u.data || {};
      setUploads(data.uploads || data.uplaods || data.results || data || []);
    } catch (e) {
      console.error('Failed loading uploads', e);
      setUploads([]);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-10">
        <h1 className="text-[40px] font-normal mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Photographer Dashboard</h1>

        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-[#111111] border border-white/[0.07] flex flex-col justify-center">
            <div className="text-[15px] text-neutral-400 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Total Uploads</div>
            <div className="text-2xl">{stats?.total_uploads || 0}</div>
          </div>
          <div className="p-6 rounded-xl bg-[#111111] border border-white/[0.07] flex flex-col justify-center">
            <div className="text-[15px] text-neutral-400 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Total Likes</div>
            <div className="text-2xl">{stats?.total_likes || 0}</div>
          </div>
          <div className="p-6 rounded-xl bg-[#111111] border border-white/[0.07] flex flex-col justify-center">
            <div className="text-[15px] text-neutral-400 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Total Comments</div>
            <div className="text-2xl">{stats?.total_comments || 0}</div>
          </div>
          <div className="p-6 rounded-xl bg-[#111111] border border-white/[0.07] flex flex-col justify-center">
            <div className="text-[15px] text-neutral-400 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Total Favourites</div>
            <div className="text-2xl">{stats?.total_favourites || 0}</div>
          </div>
        </div>

        <div className="mb-10">
          <MultiUploader onUploaded={load} />
        </div>

        <div>
          <h2 className="text-[24px] font-normal mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>My Uploads</h2>
          {uploads.length ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {uploads.map((p: any) => (
                <div key={p.id} className="relative group rounded-lg overflow-hidden border border-white/[0.07]">
                  <img src={getMediaUrl(
                    p.thumbnail || p.display || p.original || p.thumbnail_file || p.thumbnail_url
                  )} alt="thumb" className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="text-sm font-medium text-white">{p.event || p.event_name || 'Unknown Event'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No uploads yet. Start uploading photos above!</div>
          )}
        </div>
      </div>
    </div>
  );
}
