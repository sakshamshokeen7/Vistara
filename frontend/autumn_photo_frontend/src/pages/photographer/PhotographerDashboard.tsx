import React, { useEffect, useState } from 'react';
import Navbar from '../../app/Navbar';
import axios from '../../services/axiosinstances';
import { getMediaUrl } from '../../utils/media';
import MultiUploader from '../../components/MultiUploader';


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
    <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
        <h1 className="text-3xl font-bold mb-4">Photographer Dashboard</h1>

        <div className="mb-8 grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-900 rounded">Total uploads<br/>{stats?.total_uploads}</div>
          <div className="p-4 bg-gray-900 rounded">Total likes<br/>{stats?.total_likes}</div>
          <div className="p-4 bg-gray-900 rounded">Total comments<br/>{stats?.total_comments}</div>
          <div className="p-4 bg-gray-900 rounded">Total favourites<br/>{stats?.total_favourites}</div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Uploader</h2>
          <MultiUploader onUploaded={load} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">My uploads</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploads.map((p:any)=> (
              <div key={p.id} className="bg-gray-800 p-2 rounded">
                <img src={getMediaUrl(
                  p.thumbnail || p.display || p.original || p.thumbnail_file || p.thumbnail_url
                )} alt="thumb" className="w-full h-40 object-cover rounded" />
                <div className="mt-2 text-sm">{p.event || p.event_name || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
