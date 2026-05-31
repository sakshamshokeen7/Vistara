import { useEffect, useState, type SetStateAction } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import PhotoModal from "../../components/PhotoModal";
import { getMediaUrl } from "../../utils/media";
import { Search, ArrowLeft, Grid3x3, Columns, Images, Users } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-12 md:py-14">
        {/* Page Hero */}
        <div className="mb-12 animate-fadeUp">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="font-sans text-xs font-medium text-blue-500 uppercase tracking-widest">Featured</span>
          </div>
          <h1 className="font-serif text-5xl text-[#f5f5f5] mb-3">Events</h1>
          <p className="font-sans text-sm text-neutral-500">Discover and explore upcoming events</p>
        </div>
        <div className="mb-10 space-y-5">
          {/* Main search input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-[10px] bg-[#111111] border border-white/[0.08] text-[#f5f5f5] placeholder-[#4a4a4a] focus:outline-none focus:border-blue-500/40 transition-colors duration-200 font-sans text-sm"
              />
            </div>
            <button
              onClick={() => handleSearch(search)}
              className="px-6 py-3 rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white transition-all duration-150 font-sans text-xs font-medium active:scale-[0.97] whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Location and date filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Location</label>
              <input
                type="text"
                placeholder="Location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">From Date</label>
              <input
                type="datetime-local"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">To Date</label>
              <input
                type="datetime-local"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleSearch(search)}
              className="btn-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {!selectedEvent && searchMode === "events" && (
          <div className="mt-12">
            {events.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    onClick={() => handleSelectEvent(ev)}
                    className="card group cursor-pointer overflow-hidden"
                    style={{ animation: `cardIn 0.45s ease both`, animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={getMediaUrl(ev.cover) || "/placeholder_event.jpg"}
                        alt={ev.name}
                        className="w-full h-full object-cover filter brightness-[0.78] saturate-[0.55] contrast-[1.05] group-hover:brightness-[0.9] group-hover:saturate-[0.65] group-hover:scale-[1.06] transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
                      
                      {/* Attendee pill - top right */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full text-neutral-400 text-[11px] font-sans border border-white/[0.09]">
                        <Users className="w-3 h-3" />
                        <span>{ev.coordinators?.length || 0}</span>
                      </div>

                      {/* Status pill - bottom left */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-blue-300 text-[11px] font-sans border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span>Upcoming</span>
                      </div>
                    </div>

                    <div className="px-4 py-4">
                      <h3 className="font-serif text-base font-normal text-[#f0f0f0] mb-2 line-clamp-1">
                        {ev.name}
                      </h3>
                      <p className="font-sans text-[12px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                        <a href="#" className="text-blue-500 hover:text-blue-400 text-[12px] font-sans transition-colors">
                          View photos
                          <svg className="w-3 h-3 ml-1 inline group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                        {canEditEvent(ev) && (
                          <button
                            onClick={(e) => openEditModal(ev, e)}
                            className="btn-primary px-3 py-1 text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="empty-state-icon mx-auto mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h2 className="font-serif text-xl text-neutral-400">No events found</h2>
                <p className="font-sans text-sm text-neutral-600 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

       
        {(selectedEvent || searchMode === "photos") && (
          <div className="animate-fadeUp">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 rounded-xl card border border-white/[0.07] bg-[#111111]">
              <div>
                <button
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors mb-3 group font-sans text-sm"
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
                  <span className="font-medium">Back to events</span>
                </button>
                <h2 className="font-serif text-h2 text-[#f5f5f5]">
                  {selectedEvent ? selectedEvent.name : `Search Results: "${searchQuery}"`}
                </h2>
                <p className="font-sans text-sm text-neutral-600 mt-2">{photos.length} photos available</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">
                <button
                  onClick={() => setView("grid")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-sans text-xs font-medium transition-all duration-150 ${
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-sans text-xs font-medium transition-all duration-150 ${
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-sans text-xs font-medium transition-all duration-150 ${
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
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="card group cursor-pointer overflow-hidden"
                        style={{ animation: `cardIn 0.45s ease both`, animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="relative overflow-hidden h-48">
                          <img src={getMediaUrl(p.thumbnail_file)}
                            alt="Event photo"
                            className="w-full h-full object-cover filter brightness-[0.78] saturate-[0.55] contrast-[1.05] group-hover:brightness-[0.9] group-hover:saturate-[0.65] group-hover:scale-[1.06] transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {view === "masonry" && (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {photos.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="card group cursor-pointer overflow-hidden mb-4 break-inside-avoid"
                        style={{ animation: `cardIn 0.45s ease both`, animationDelay: `${idx * 50}ms` }}
                      >
                        <img
                          src={getMediaUrl(p.thumbnail_file)}
                          alt="Event photo"
                          className="w-full filter brightness-[0.78] saturate-[0.55] contrast-[1.05] group-hover:brightness-[0.9] group-hover:saturate-[0.65] group-hover:scale-[1.06] transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {view === "carousel" && (
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-blue-600/30 scrollbar-track-white/5">
                      {photos.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                          className="card group cursor-pointer overflow-hidden flex-shrink-0 snap-center"
                          style={{ animation: `cardIn 0.45s ease both`, animationDelay: `${idx * 50}ms` }}
                        >
                          <img
                            src={getMediaUrl(p.thumbnail_file)}
                            alt="Event photo"
                            className="h-80 w-auto object-cover filter brightness-[0.78] saturate-[0.55] contrast-[1.05] group-hover:brightness-[0.9] group-hover:saturate-[0.65] group-hover:scale-[1.06] transition-all duration-500"
                          />
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
                <div className="empty-state-icon mx-auto mb-6">
                  <Images className="w-10 h-10" />
                </div>
                <h2 className="font-serif text-xl text-neutral-400">No photos found</h2>
                <p className="font-sans text-sm text-neutral-600 mt-2">Photos will appear here once uploaded</p>
              </div>
            )}
          </div>
        )}

        {editModalOpen && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08] shadow-2xl">
              <div className="sticky top-0 bg-[#111111] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <h2 className="font-serif text-3xl text-[#f5f5f5]">Edit Event</h2>
                <button onClick={closeEditModal} className="text-neutral-600 hover:text-white text-2xl leading-none transition-colors">&times;</button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-red-300 text-sm font-sans">
                    {JSON.stringify(error)}
                  </div>
                )}

                <div>
                  <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">Event Name</label>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field w-full" />
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="input-field w-full resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">Start Date & Time</label>
                    <input type="datetime-local" value={editStartDatetime} onChange={(e) => setEditStartDatetime(e.target.value)} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">End Date & Time</label>
                    <input type="datetime-local" value={editEndDatetime} onChange={(e) => setEditEndDatetime(e.target.value)} className="input-field w-full" />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">Location</label>
                  <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="input-field w-full" />
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wider">Cover Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setEditCover(e.target.files?.[0] || null)} className="w-full text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer file:hover:bg-blue-600 transition-colors" />
                  <p className="font-sans text-sm text-neutral-600 mt-1">Leave empty to keep current cover</p>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="editPublic" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} className="w-4 h-4 rounded bg-[#111111] border border-white/[0.07] cursor-pointer accent-blue-500" />
                  <label htmlFor="editPublic" className="font-sans text-sm text-neutral-400 cursor-pointer">Public Event</label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Updating..." : "Update Event"}
                  </button>
                  <button type="button" onClick={closeEditModal} className="btn-secondary">
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