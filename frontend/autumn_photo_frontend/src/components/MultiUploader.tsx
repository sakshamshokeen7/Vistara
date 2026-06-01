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
        setEvents(data?.events ?? data ?? []);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <h1 className="text-3xl font-bold mb-6">Upload Photos</h1>

        {/* Event selector */}
        <div className="mb-6">
          <label className="block mb-2 text-sm text-gray-300">
            Select Event
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700"
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
          className={`p-12 rounded-2xl border-2 border-dashed mb-6 transition ${
            dragOver
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 bg-gray-900/40"
          }`}
        >
          <div className="text-center">
            <Upload className="mx-auto mb-4 w-10 h-10 text-gray-400" />
            <p className="text-gray-300">Drag & drop photos here</p>
            <p className="text-gray-500 text-sm mb-4">or</p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700">
              <Image className="w-5 h-5" />
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
            className={`flex items-center gap-2 mb-6 p-4 rounded-xl ${
              message.includes("Uploaded")
                ? "bg-green-500/10 text-green-400"
                : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {message.includes("Uploaded") ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-800"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedEvent || files.length === 0}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading…"
            : `Upload ${files.length || ""} Photos`}
        </button>
      </div>
    </div>
  );
}
