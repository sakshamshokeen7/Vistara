import { useEffect, useState, type SetStateAction } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import PhotoModal from "../../components/PhotoModal";
import { getMediaUrl } from "../../utils/media";
import { Search, ArrowLeft, Grid3x3, Columns, Images, Calendar, Users, Sparkles, Edit2 } from "lucide-react";

interface Event {
  cover_upload: string;
  id: number;
  name: string;
  description: string;
  cover_photo?: string;
  coordinators?: Array<any>;
}

interface Photo {
  thumbnail_file: string;
  id: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [view, setView] = useState("grid");
  const [openPhotoId, setOpenPhotoId] = useState<number | null>(null);
  const [openPhotoUrl, setOpenPhotoUrl] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"events" | "photos">("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const role = useSelector((s: any) => s.auth.role);
  const email = useSelector((s: any) => s.auth.email);


  const fetchEvents = async (query = "", location = "", dateFrom = "", dateTo = "") => {
    try {
      let url = `/events/?search=${encodeURIComponent(query)}`;
      if (location) {
        url += `&search=${encodeURIComponent(location)}`;
      }
      if (dateFrom) {
        url += `&date_from=${encodeURIComponent(dateFrom)}`;
      }
      if (dateTo) {
        url += `&date_to=${encodeURIComponent(dateTo)}`;
      }
      const res = await axios.get(url);
      // Handle paginated response
      const eventsList = res.data.results || res.data;
      setEvents(eventsList);
    } catch (e) {
      console.log(e);
    }
  };

 const fetchPhotos = async (id:any) => {
  try {
    const res = await axios.get(`/events/${id}/photos/`);
    console.log("Photos -> ", res.data.photos);
    setPhotos(res.data.photos || []);
  } catch (e) {
    console.error('Failed to fetch photos for event', id, e);
    setPhotos([]);
  }
};

  const handleSearch = async (query = "") => {
    await fetchEvents(query, searchLocation, searchDateFrom, searchDateTo);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchLocation("");
    setSearchDateFrom("");
    setSearchDateTo("");
    fetchEvents();
  };



  useEffect(() => {
    fetchEvents(); 
  }, []);

  const openEditModal = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingEvent(event);
    setEditName(event.name || "");
    setEditDescription(event.description || "");
    setEditStartDatetime((event as any).start_datetime || "");
    setEditEndDatetime((event as any).end_datetime || "");
    setEditLocation((event as any).location || "");
    setEditIsPublic((event as any).is_public !== false);
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
      if (editCover) {
        form.append("cover_upload", editCover);
      }

      // axios automatically handles multipart/form-data when FormData is passed
      await axios.patch(`/events/${editingEvent.id}/`, form);
      setLoading(false);
      closeEditModal();
      await fetchEvents();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  const canEditEvent = (event: Event) => {
    if (role === "EVENT_COORDINATOR" && event.coordinators) {
      const isCoordinator = event.coordinators.some((c: any) => {
        const coordinatorEmail = typeof c === "object" ? c.email : c;
        return coordinatorEmail === email;
      });
      return isCoordinator;
    }
    return false;
  };

  const handleSelectEvent = (ev: SetStateAction<Event | null>) => {
    setSelectedEvent(ev);
    if (ev && typeof ev === "object" && "id" in ev) {
      fetchPhotos(ev.id);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#0a0a0a] text-[#f5f5f5]">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-10">
        {/* Hero section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[11px] font-medium text-blue-500 uppercase tracking-[0.1em]">Discover Events</span>
          </div>
          <h1 className="text-5xl md:text-5xl font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Events
          </h1>
          <p className="text-[13px] text-neutral-600 mt-2">Explore and discover upcoming events</p>
        </div>

        {/* Search and filters */}
        <div className="mb-10 space-y-3">
          {/* Main search input */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600">
              <Search className="w-4 h-4" />
            </div>
            <input
              onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
              type="text"
              placeholder="Search by event name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input !pl-10 !pr-24"
            />
            <button
              onClick={() => handleSearch(search)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium rounded-lg transition-all duration-150"
            >
              Search
            </button>
          </div>

          {/* Location and date filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="Search by location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">From Date</label>
              <input
                type="datetime-local"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5">To Date</label>
              <input
                type="datetime-local"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSearch(search)}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium rounded-lg transition-all duration-150 active:scale-[0.97]"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-transparent border border-white/[0.08] text-neutral-400 text-[13px] font-medium rounded-lg hover:text-white hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-150"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {!selectedEvent && searchMode === "events" && (
          <div>
            {events.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleSelectEvent(ev)}
                    className="group cursor-pointer bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden hover:border-blue-500/28 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/65"
                  >
                    {/* Image section */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={getMediaUrl(ev.cover) || "/placeholder_event.jpg"}
                        alt={ev.name}
                        className="w-full h-full object-cover filter brightness-78 saturate-55 contrast-105 group-hover:brightness-90 group-hover:saturate-65 group-hover:scale-106 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
                      
                      {/* Top-right attendee count */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-md border border-white/[0.09] px-2.5 py-1 rounded-full text-[11px] text-neutral-400 font-normal">
                        <Users className="w-3 h-3" />
                        <span>{ev.coordinators?.length || 0}</span>
                      </div>

                      {/* Bottom-left status */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-blue-500/18 px-2.5 py-1 rounded-full text-[11px] text-blue-300 font-normal">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>Upcoming</span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-4 pt-3.5 pb-4">
                      <h2 className="text-[15px] font-normal text-[#f0f0f0] line-clamp-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                        {ev.name}
                      </h2>
                      <p className="text-[12px] text-neutral-600 line-clamp-2 leading-relaxed mt-1">
                        {ev.description}
                      </p>
                      
                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                        <div className="flex items-center text-blue-500 text-[12px] font-normal group-hover:text-blue-400 transition-colors duration-200">
                          <span>View photos</span>
                          <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        {canEditEvent(ev) && (
                          <button
                            onClick={(e) => openEditModal(ev, e)}
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 border border-white/[0.07] hover:border-blue-500/25 transition-all duration-150"
                            title="Edit event"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-blue-500/[0.06] border border-blue-500/[0.12] flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-blue-900" />
                </div>
                <p className="text-neutral-400 text-[15px]" style={{ fontFamily: "'Instrument Serif', serif" }}>No events found</p>
                <p className="text-neutral-600 text-[13px] mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

       
        {(selectedEvent || searchMode === "photos") && (
          <div>
            {/* Header for photo view */}
            <div className="mb-8 pb-6 border-b border-white/[0.05]">
              <button
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors mb-4 group text-[13px] font-medium"
                onClick={() => {
                  setSelectedEvent(null);
                  setPhotos([]);
                  setSearchMode("events");
                  setSearchQuery("");
                  setSearch("");
                  fetchEvents();
                }}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to events</span>
              </button>
              <h1 className="text-4xl font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {selectedEvent ? selectedEvent.name : `Search Results`}
              </h1>
              <p className="text-[13px] text-neutral-600 mt-2">{photos.length} photos available</p>

              {/* View toggle */}
              <div className="mt-6 flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg w-fit">
                <button
                  onClick={() => setView("grid")}
                  className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-150 ${
                    view === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-neutral-500 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setView("masonry")}
                  className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-150 ${
                    view === "masonry"
                      ? "bg-blue-500 text-white"
                      : "text-neutral-500 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span className="hidden sm:inline">Masonry</span>
                </button>
                <button
                  onClick={() => setView("carousel")}
                  className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-150 ${
                    view === "carousel"
                      ? "bg-blue-500 text-white"
                      : "text-neutral-500 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Images className="w-4 h-4" />
                  <span className="hidden sm:inline">Carousel</span>
                </button>
              </div>
            </div>

            {photos.length > 0 ? (
              <>
                {view === "grid" && (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="group relative rounded-xl overflow-hidden bg-[#111111] border border-white/[0.07] hover:border-blue-500/28 transition-all duration-300 hover:shadow-2xl hover:shadow-black/65 cursor-pointer"
                      >
                        <img src={getMediaUrl(p.thumbnail_file)}
                          alt="Event photo"
                          className="w-full h-56 object-cover filter brightness-78 saturate-55 contrast-105 group-hover:brightness-90 group-hover:saturate-65 group-hover:scale-106 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {view === "masonry" && (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-5">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="group relative rounded-xl overflow-hidden bg-[#111111] border border-white/[0.07] hover:border-blue-500/28 transition-all duration-300 hover:shadow-2xl hover:shadow-black/65 cursor-pointer mb-5 break-inside-avoid"
                      >
                        <img
                          src={getMediaUrl(p.thumbnail_file)}
                          alt="Event photo"
                          className="w-full filter brightness-78 saturate-55 contrast-105 group-hover:brightness-90 group-hover:saturate-65 group-hover:scale-106 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {view === "carousel" && (
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                          className="group relative rounded-xl overflow-hidden bg-[#111111] border border-white/[0.07] hover:border-blue-500/28 transition-all duration-300 hover:shadow-2xl hover:shadow-black/65 flex-shrink-0 snap-center"
                        >
                          <img
                            src={getMediaUrl(p.thumbnail_file)}
                            alt="Event photo"
                            className="h-72 w-auto object-cover filter brightness-78 saturate-55 contrast-105 group-hover:brightness-90 group-hover:saturate-65 group-hover:scale-106 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {openPhotoId && (
                  <PhotoModal
                    photoId={openPhotoId}
                    photoUrl={openPhotoUrl}
                    onClose={() => { setOpenPhotoId(null); setOpenPhotoUrl(""); }}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-blue-500/[0.06] border border-blue-500/[0.12] flex items-center justify-center mx-auto mb-6">
                  <Images className="w-10 h-10 text-blue-900" />
                </div>
                <p className="text-neutral-400 text-[15px]" style={{ fontFamily: "'Instrument Serif', serif" }}>No photos found</p>
                <p className="text-neutral-600 text-[13px] mt-2">Photos will appear here once uploaded</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Event Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-[#111111] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <h2 className="text-[20px] font-normal text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', serif" }}>Edit Event</h2>
                <button onClick={closeEditModal} className="text-neutral-600 hover:text-white text-2xl transition-colors duration-150" title="Close">×</button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-5">
                {error && <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-[13px] text-red-300">{JSON.stringify(error)}</div>}

                <div>
                  <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">Event Name</label>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)} className="input w-full" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="input w-full resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">Start Date & Time</label>
                    <input type="datetime-local" value={editStartDatetime} onChange={(e) => setEditStartDatetime(e.target.value)} className="input w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">End Date & Time</label>
                    <input type="datetime-local" value={editEndDatetime} onChange={(e) => setEditEndDatetime(e.target.value)} className="input w-full" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">Location</label>
                  <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="input w-full" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-600 mb-1.5 block">Cover Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setEditCover(e.target.files?.[0] || null)} className="w-full text-neutral-400 text-[13px] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer file:font-medium file:text-[13px] hover:file:bg-blue-600 transition-colors duration-150" />
                  <p className="text-[12px] text-neutral-600 mt-1.5">Leave empty to keep current cover</p>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="editPublic" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} className="w-4 h-4 rounded border border-white/[0.07] bg-[#0f0f0f] cursor-pointer accent-blue-500" />
                  <label htmlFor="editPublic" className="text-[13px] text-neutral-400 cursor-pointer">Public Event</label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97]">
                    {loading ? "Updating..." : "Update Event"}
                  </button>
                  <button type="button" onClick={closeEditModal} className="px-5 py-2.5 bg-transparent border border-white/[0.08] text-neutral-400 text-[13px] font-medium rounded-lg hover:text-white hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-150">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
