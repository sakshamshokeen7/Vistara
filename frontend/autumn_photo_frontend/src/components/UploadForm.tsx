import React, { useCallback, useEffect, useState } from "react";
import { getEvents } from "../services/eventservice";
import photoService from "../services/photoService";
import { Upload, X, Image, CheckCircle, AlertCircle } from "lucide-react";

type EventType = {
  id: number;
  name: string;
};

interface UploadFormProps {
  onUploadComplete?: () => void;
}

export default function UploadForm({ onUploadComplete }: UploadFormProps) {
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
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data?.results && Array.isArray(data.results)) {
          setEvents(data.results);
        } else if (data?.events && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
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
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (e: any) {
      console.error(e);
      setMessage(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Event selector */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
          Select Event
        </label>
        <select
          className="input-field w-full"
          value={selectedEvent ?? ""}
          onChange={(e) => setSelectedEvent(Number(e.target.value))}
        >
          <option value="">Choose an event…</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
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
        className={`p-8 rounded-xl border-2 border-dashed transition ${
          dragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/[0.08] bg-white/[0.02]"
        }`}
      >
        <div className="text-center">
          <Upload className="mx-auto mb-3 w-8 h-8 text-neutral-500" />
          <p className="text-neutral-300 font-sans text-sm">Drag & drop photos here</p>
          <p className="text-neutral-500 text-xs mb-3">or</p>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-150 font-sans text-xs font-medium">
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
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.includes("Uploaded")
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
          }`}
        >
          {message.includes("Uploaded") ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Files to upload ({files.length})</p>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Image className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span className="text-sm text-neutral-300 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="ml-2 text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedEvent}
          className="btn-primary w-full"
        >
          {uploading ? "Uploading..." : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
