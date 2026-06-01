import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosinstances";
import Navbar from "../../app/Navbar";

export default function Dashboard() {
  const role = useSelector((s: any) => s.auth.role);
  const email = useSelector((s: any) => s.auth.email);
  const navigate = useNavigate();
  
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState<File | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/events/");
      // Filter events where user is coordinator
      const allEvents = Array.isArray(res.data) ? res.data : res.data.results || [];
      setMyEvents(allEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    setEditCover(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
    setError("");
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
      if (editCover) form.append("cover_upload", editCover);

      await axios.patch(`/events/${editingEvent.id}/`, form);
      setLoading(false);
      closeEditModal();
      await fetchMyEvents();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  if (role === "ADMIN") {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-10">
          <h1 className="text-[40px] font-normal mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Dashboard</h1>
          <p className="text-neutral-600 text-[13px]">You are an admin. Please use the Admin Panel to manage events.</p>
        </div>
      </div>
    );
  }

  if (role !== "EVENT_COORDINATOR") {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-10">
          <h1 className="text-[40px] font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Dashboard</h1>
          <p className="text-neutral-600 text-[13px]">Welcome, {email}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-10">
        <h1 className="text-[40px] font-normal mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>Event Coordinator</h1>

        <div className="mb-10 p-6 rounded-xl bg-[#111111] border border-white/[0.07]">
          <h2 className="text-[20px] font-normal mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>My Events</h2>
          {loading ? (
            <div className="text-neutral-600 text-[13px]">Loading events...</div>
          ) : (
            <div className="space-y-3">
              {myEvents.length === 0 && (
                <div className="text-neutral-600 text-center py-8 text-[13px]">
                  No events assigned to you yet.
                </div>
              )}
              {myEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-white/[0.07] rounded-lg hover:border-white/[0.13] hover:bg-white/[0.02] transition-all duration-150"
                >
                  <div className="flex-1">
                    <div className="font-normal text-[14px] text-[#f0f0f0]" style={{ fontFamily: "'Instrument Serif', serif" }}>{ev.name}</div>
                    <div className="text-[12px] text-neutral-600 mt-1">
                      {ev.start_datetime} — {ev.end_datetime}
                    </div>
                    <div className="text-[12px] text-neutral-700 mt-1">{ev.location}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/events`)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97]"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(ev)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08] shadow-2xl">
              <div className="sticky top-0 bg-[#111111] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <h2 className="text-[20px] font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>Edit Event</h2>
                <button
                  onClick={closeEditModal}
                  className="text-neutral-600 hover:text-white text-2xl transition-colors duration-150"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-[13px] text-red-300">
                    {JSON.stringify(error)}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Event Name</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="input w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editStartDatetime}
                      onChange={(e) => setEditStartDatetime(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editEndDatetime}
                      onChange={(e) => setEditEndDatetime(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Location</label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Cover Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditCover(e.target.files?.[0] || null)}
                    className="w-full text-neutral-400 text-[13px] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer file:font-medium file:text-[13px] hover:file:bg-blue-600 transition-colors duration-150"
                  />
                  <p className="text-[12px] text-neutral-600 mt-1.5">Leave empty to keep current cover</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editPublic"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border border-white/[0.07] bg-[#0f0f0f] cursor-pointer accent-blue-500"
                  />
                  <label htmlFor="editPublic" className="text-[13px] text-neutral-400 cursor-pointer">
                    Public Event
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-[13px] font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97]"
                  >
                    {loading ? "Updating..." : "Update Event"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-5 py-2.5 bg-transparent border border-white/[0.08] text-neutral-400 rounded-lg text-[13px] font-medium hover:text-white hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-150"
                  >
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
