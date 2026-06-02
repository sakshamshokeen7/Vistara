import React, { useCallback, useEffect, useState } from "react";
import { getEvents } from "../services/eventservice";
import photoService from "../services/photoService";
import { Upload, X, Image, CheckCircle, AlertCircle } from "lucide-react";

type EventType = {
  id: number;
  name: string;
};

export default function MultipleUploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data?.results ?? data?.events ?? (Array.isArray(data) ? data : []));
      } catch (e) {
        console.error("Failed loading events", e);
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

 
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedEvent) {
      setMessage("Please select an event");
      return;
    }

    if (files.length === 0) {
      setMessage("Please add files to upload");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const res = await photoService.uploadMultiplePhotos(selectedEvent, files);
      setMessage(`Uploaded ${res.uploaded_count ?? files.length} photos`);
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      setMessage(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="w-full text-[#f5f5f5]">
      <div className="w-full">
        <h2 className="text-[24px] font-normal mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>Upload Photos</h2>

        {/* Event selector */}
        <div className="mb-6">
          <label className="block mb-2 text-[15px] font-normal text-neutral-400" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Select Event
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-white/[0.07] text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            value={selectedEvent ?? ""}
            onChange={(e) => setSelectedEvent(Number(e.target.value))}
          >
            <option value="" className="bg-[#111111]">Choose an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} className="bg-[#111111]">
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`p-12 rounded-xl border border-dashed mb-6 transition-all duration-200 ${
            dragOver
              ? "border-blue-500 bg-blue-500/5"
              : "border-white/[0.2] bg-[#111111]"
          }`}
        >
          <div className="text-center">
            <Upload className="mx-auto mb-4 w-10 h-10 text-neutral-500" />
            <p className="text-neutral-300">Drag & drop photos here</p>
            <p className="text-neutral-500 text-sm mb-4 mt-1">or</p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[14px] font-medium transition-colors">
              <Image className="w-4 h-4" />
              Browse Files
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 mb-6 p-4 rounded-xl border ${
              message.includes("Uploaded")
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.includes("Uploaded") ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-[14px]">{message}</span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#111111] border border-white/[0.07]"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-200 truncate">{file.name}</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-neutral-500 hover:text-red-400 transition-colors p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedEvent || files.length === 0}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-white/[0.04] disabled:text-neutral-500 disabled:border disabled:border-white/[0.07] disabled:cursor-not-allowed text-[15px] font-medium transition-all duration-200"
        >
          {uploading
            ? "Uploading…"
            : `Upload ${files.length > 0 ? files.length : ""} ${files.length === 1 ? "Photo" : "Photos"}`}
        </button>
      </div>
    </div>
  );
}
