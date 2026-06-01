import React, { useState, useEffect } from "react";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const role = useSelector((s:any) => s.auth.role);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [cover, setCover] = useState<File | null>(null);
  const [coordinators, setCoordinators] = useState("");
  const [selectedCoordinators, setSelectedCoordinators] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState<File | null>(null);
  const [editCoordinators, setEditCoordinators] = useState<number[]>([]);

  const ROLE_OPTIONS = [
    "ADMIN",
    "EVENT_COORDINATOR",
    "PHOTOGRAPHER",
    "IMG_MEMBER",
    "PUBLIC",
  ];

  useEffect(() => {
    (async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get('/adminpanel/users/');
        setUsers(res.data.users || []);
      } catch (e) {
      } finally {
        setUsersLoading(false);
      }
    })();
    (async () => {
      setEventsLoading(true);
      try {
        const res = await axios.get('/events/');
        setEvents(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } catch (e) {
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  if (role !== "ADMIN") {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
          <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
          <div className="p-6 rounded bg-gray-900/50 border border-gray-800">You are not authorized to access this page.</div>
        </div>
      </div>
    );
  }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      if (startDatetime) form.append("start_datetime", startDatetime);
      if (endDatetime) form.append("end_datetime", endDatetime);
      form.append("location", location);
      form.append("is_public", isPublic ? "true" : "false");
      selectedCoordinators.forEach(id => form.append("coordinators", String(id)));
      if (cover) form.append('cover_upload', cover);
      await axios.post('/adminpanel/create-event/', form);
      setLoading(false);
      navigate('/events');
    } catch (err:any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  const refreshUsers = async () => {
    try {
      const res = await axios.get('/adminpanel/users/');
      setUsers(res.data.users || []);
    } catch (e) {}
  };

  const refreshEvents = async () => {
    try {
      const res = await axios.get('/events/');
      setEvents(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (e) {}
  };

  const deleteEvent = async (id:number) => {
    const ok = window.confirm('Delete this event? This action cannot be undone.');
    if (!ok) return;
    try {
      const resp = await axios.delete(`/events/${id}/`);
      if (resp.status === 204 || resp.status === 200) {
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        await refreshEvents();
      }
    } catch (e:any) {
      console.error('Failed to delete event', e);
      const msg = e.response?.data || e.message || String(e);
      setError(msg);
    }
  };

  const toggleUser = async (userId:number) => {
    try {
      await axios.post('/adminpanel/toggle-user/', { user_id: userId });
      await refreshUsers();
    } catch (e:any) {
      console.error(e);
    }
  };

  const assignRole = async (userId:number, roleName:string) => {
    try {
      await axios.post('/adminpanel/assign-role/', { user_id: userId, role_name: roleName });
      await refreshUsers();
    } catch (e:any) {
      console.error(e);
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEditName(event.name || "");
    setEditDescription(event.description || "");
    setEditStartDatetime(event.start_datetime || "");
    setEditEndDatetime(event.end_datetime || "");
    setEditLocation(event.location || "");
    setEditIsPublic(event.is_public !== false);
    setEditCoordinators(event.coordinators || []);
    setEditCover(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", editName);
      form.append("description", editDescription);
      if (editStartDatetime) form.append("start_datetime", editStartDatetime);
      if (editEndDatetime) form.append("end_datetime", editEndDatetime);
      form.append("location", editLocation);
      form.append("is_public", editIsPublic ? "true" : "false");
      editCoordinators.forEach(id => form.append("coordinators", String(id)));
      if (editCover) form.append('cover_upload', editCover);
      
      await axios.patch(`/events/${editingEvent.id}/`, form);
      setLoading(false);
      closeEditModal();
      await refreshEvents();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
        <h1 className="text-3xl font-bold mb-4">Admin Panel — Create Event</h1>
        <div className="mb-8 p-4 rounded bg-gray-900/50 border border-gray-800">
          <h2 className="text-xl font-semibold mb-3">Manage Users</h2>
          {usersLoading ? (
            <div>Loading users...</div>
          ) : (
            <div className="space-y-3">
              {users.length === 0 && <div className="text-gray-400">No users found.</div>}
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-4 p-3 bg-gray-800 rounded">
                  <div>
                    <div className="font-medium">{u.full_name || u.email}</div>
                    <div className="text-sm text-gray-400">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select defaultValue={u.role || (u.is_superuser? 'ADMIN':'PUBLIC')} onChange={(e)=>assignRole(u.id, e.target.value)} className="p-2 bg-gray-700 rounded">
                      {ROLE_OPTIONS.map(r=> <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={()=>toggleUser(u.id)} className="px-3 py-1 bg-red-600 rounded text-sm">{u.is_active ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 p-4 rounded bg-gray-900/50 border border-gray-800">
          <h2 className="text-xl font-semibold mb-3">Events</h2>
          {eventsLoading ? (
            <div>Loading events...</div>
          ) : (
            <div className="space-y-2">
              {events.length === 0 && <div className="text-gray-400">No events found.</div>}
              {events.map((ev:any) => (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <div className="font-medium">{ev.name}</div>
                    <div className="text-sm text-gray-400">{ev.start_datetime} — {ev.end_datetime}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/events/${ev.id}`)} className="px-3 py-1 bg-indigo-600 rounded text-sm">View</button>
                    <button onClick={() => openEditModal(ev)} className="px-3 py-1 bg-green-600 rounded text-sm">Edit</button>
                    <button onClick={() => deleteEvent(ev.id)} className="px-3 py-1 bg-red-600 rounded text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="max-w-3xl space-y-4">
          {error && <div className="p-3 rounded bg-red-800 text-red-200">{JSON.stringify(error)}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-3 rounded bg-gray-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start datetime</label>
              <input type="datetime-local" value={startDatetime} onChange={e=>setStartDatetime(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End datetime</label>
              <input type="datetime-local" value={endDatetime} onChange={e=>setEndDatetime(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={location} onChange={e=>setLocation(e.target.value)} className="w-full p-3 rounded bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cover photo</label>
            <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Coordinators</label>
            <select multiple value={selectedCoordinators.map(String)} onChange={(e)=>{
              const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
              setSelectedCoordinators(opts);
            }} className="w-full p-3 rounded bg-gray-800">
              {users.map(u=> (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
            <div className="text-sm text-gray-400 mt-1">Hold Ctrl/Cmd to multi-select.</div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} /> Public</label>
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded">{loading? 'Creating...':'Create Event'}</button>
          </div>
        </form>

        {editModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Event</h2>
                <button onClick={closeEditModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              
              <form onSubmit={submitEdit} className="p-6 space-y-4">
                {error && <div className="p-3 rounded bg-red-800 text-red-200">{JSON.stringify(error)}</div>}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input required value={editName} onChange={e=>setEditName(e.target.value)} className="w-full p-3 rounded bg-gray-800" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="w-full p-3 rounded bg-gray-800 h-24" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start datetime</label>
                    <input type="datetime-local" value={editStartDatetime} onChange={e=>setEditStartDatetime(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End datetime</label>
                    <input type="datetime-local" value={editEndDatetime} onChange={e=>setEditEndDatetime(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input value={editLocation} onChange={e=>setEditLocation(e.target.value)} className="w-full p-3 rounded bg-gray-800" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Cover photo</label>
                  <input type="file" accept="image/*" onChange={e=>setEditCover(e.target.files?.[0] || null)} className="text-gray-300" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Coordinators</label>
                  <select 
                    multiple 
                    value={editCoordinators.map(String)} 
                    onChange={(e)=>{
                      const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
                      setEditCoordinators(opts);
                    }} 
                    className="w-full p-3 rounded bg-gray-800"
                  >
                    {users.map(u=> (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-400 mt-1">Hold Ctrl/Cmd to multi-select</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editIsPublic} onChange={e=>setEditIsPublic(e.target.checked)} /> 
                    Public
                  </label>
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 rounded font-semibold">
                    {loading ? 'Updating...' : 'Update Event'}
                  </button>
                  <button type="button" onClick={closeEditModal} className="px-6 py-2 bg-gray-700 rounded font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
