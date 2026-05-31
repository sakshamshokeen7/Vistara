import { useEffect, useState } from 'react';
import Navbar from '../../app/Navbar';
import axios from '../../services/axiosinstances';
import { getMediaUrl } from '../../utils/media';
import UploadForm from '../../components/UploadForm';


export default function PhotographerDashboard(){
  const [stats, setStats] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);

  const load = async () => {
    try{
      const s = await axios.get('/dashboard/stats/');
      setStats(s.data);
    }catch(e){}

    try{
      const u = await axios.get('/dashboard/uploads/');
      const data = u.data || {};
      setUploads(data.uploads || data.uplaods || data.results || data || []);
    }catch(e){
      console.error('Failed loading uploads', e);
      setUploads([]);
    }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-12 md:py-14">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-normal text-[#f5f5f5] mb-2">Photographer Dashboard</h1>
          <p className="font-sans text-sm text-neutral-500">Manage your uploads and track performance</p>
        </div>

        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Total uploads</div>
            <div className="text-2xl font-normal text-white">{stats?.total_uploads || 0}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Total likes</div>
            <div className="text-2xl font-normal text-white">{stats?.total_likes || 0}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Total comments</div>
            <div className="text-2xl font-normal text-white">{stats?.total_comments || 0}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Total favourites</div>
            <div className="text-2xl font-normal text-white">{stats?.total_favourites || 0}</div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-2xl font-normal text-[#f5f5f5] mb-5">Upload Photos</h2>
          <UploadForm onUploadComplete={load} />
        </div>

        {uploads.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#f5f5f5] mb-5">My Uploads</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploads.map((p:any)=> (
                <div key={p.id} className="card group cursor-pointer overflow-hidden">
                  <div className="relative overflow-hidden h-48">
                    <img src={getMediaUrl(
                      p.thumbnail || p.display || p.original || p.thumbnail_file || p.thumbnail_url
                    )} alt="thumb" className="w-full h-full object-cover filter brightness-[0.78] saturate-[0.55] contrast-[1.05] group-hover:brightness-[0.9] group-hover:saturate-[0.65] group-hover:scale-[1.06] transition-all duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="font-sans text-sm text-neutral-300">{p.event || p.event_name || 'Uncategorized'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
