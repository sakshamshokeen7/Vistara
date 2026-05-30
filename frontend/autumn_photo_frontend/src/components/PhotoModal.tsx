import React, { useEffect, useState } from "react";
import axios from "../services/axiosinstances";
import { Heart, Star, Download, Share2, X } from "lucide-react";

interface Props {
  photoId: number;
  photoUrl: string;
  onClose: () => void;
}
interface PhotoDetail {
  id: number;
  original_file: string;
  tags: Record<string, number>;
  likes_count: number;
  comments_count: number;
  favourites_count: number;
  person_tags: any[];
}


const PhotoModal: React.FC<Props> = ({ photoId, photoUrl, onClose }) => {
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [tagUser, setTagUser] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/`);
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const data = res.data;
      if (data?.original_file) data.original_file = norm(data.original_file);
      setDetail(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/comments/`);
      const commentsList = res.data.results || res.data || [];
      setComments(commentsList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchComments();
    const t = setInterval(fetchDetail, 3000);
    return () => clearInterval(t);
  }, [photoId]);

  const toggleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const res = await axios.post(`/photos/${photoId}/like/`);
      setLiked(res.data.liked ?? !liked);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavourite = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const res = await axios.post(`/photos/${photoId}/favourite/`);
      setFavourited(res.data.favourited ?? !favourited);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newComment.trim()) {
      console.log("Comment is empty");
      return;
    }
    try {
      console.log("Sending comment:", newComment);
      const res = await axios.post(`/photos/${photoId}/comments/add/`, { text: newComment });
      console.log("Response status:", res.status, "Data:", res.data);
      if (res.status === 201 || res.status === 200) {
        console.log("Comment added successfully:", res.data);
        setNewComment("");
        await fetchComments();
        await fetchDetail();
      }
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to add comment: " + (error.response?.data?.detail || error.message));
    }
  };

 const tagPerson = async () => {
  if (!tagUser.trim()) return;
  try {
    await axios.post(`/photos/${photoId}/tag/`, {
      tagged_user: tagUser.trim(),
    });
    setTagUser("");
    fetchDetail(); 
  } catch (e) {
    console.error(e);
  }
};



  const downloadOriginal = async () => {
    try {
      setDownloading(true);
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const url = norm(detail?.original_file || photoUrl);
      
      const response = await fetch(url || "");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `photo_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
     
      window.URL.revokeObjectURL(blobUrl);
      setDownloading(false);
    } catch (e) {
      console.error(e);
      setDownloading(false);
      alert("Failed to download image");
    }
  };

  const shareLink = async () => {
    try {
      const shareUrl = window.location.origin + `/photos/${photoId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to copy link");
    }
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 text-white rounded-xl max-w-4xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <div className="font-semibold">Photo</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800">
            <X />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:flex-1 bg-black flex items-center justify-center">
            <img src={detail?.original_file || photoUrl} alt="photo" className="max-h-[70vh] object-contain" />
          </div>

          <div className="w-full md:w-96 p-4 border-l border-gray-800">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button onClick={(e) => toggleLike(e)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{detail?.likes_count ?? 0}</span>
              </button>

              <button onClick={(e) => toggleFavourite(e)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Star className="w-4 h-4" />
                <span className="text-sm">{detail?.favourites_count ?? 0}</span>
              </button>

              <button 
                onClick={downloadOriginal} 
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{downloading ? "Downloading..." : "Download"}</span>
              </button>

              <button 
                onClick={shareLink} 
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="font-medium mb-2">Tag someone</div>
              <div className="flex gap-2">
                <input value={tagUser} onChange={(e)=>setTagUser(e.target.value)} placeholder="enter email address " className="flex-1 p-2 bg-gray-800 rounded" />
                <button onClick={tagPerson} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors">Tag</button>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Comments</div>
              <div className="max-h-40 overflow-y-auto mb-2 space-y-2">
                {comments.length ? comments.map((c)=> (
                  <div key={c.id} className="p-2 bg-gray-800 rounded text-sm">
                    <div className="font-semibold text-xs">{c.user_name}</div>
                    <div>{c.text}</div>
                  </div>
                )) : <div className="text-gray-400 text-sm">No comments yet</div>}
              </div>

              <div className="flex gap-2">
                <input value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="Add a comment" className="flex-1 p-2 bg-gray-800 rounded" />
                <button type="button" onClick={(e) => addComment(e)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors">Send</button>
              </div>
            </div>
            {detail?.person_tags?.length > 0 && (
  <div className="mb-4">
    <div className="font-medium mb-1">Tagged</div>
    <div className="flex flex-wrap gap-2">
      {detail?.person_tags.map((t: any) => (
        <span
          key={t.id}
          className="px-2 py-1 text-sm bg-gray-800 rounded"
        >
          @{t.tagged_user_name}
        </span>
      ))}
    </div>
  </div>
)}
          {detail?.tags && (
  <div className="mt-4">
    <h4 className="text-sm font-semibold text-gray-300 mb-2">
      AI Tags
    </h4>

    <div className="flex flex-wrap gap-2">
      {Object.entries(detail.tags)
        .filter(([_, score]) => Number(score) > 0.05)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 8)
        .map(([tag]) => (
          <span
            key={tag}
            className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
    </div>
  </div>
)}



          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
