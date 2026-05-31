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
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

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
    const detailInterval = setInterval(fetchDetail, 3000);
    const commentsInterval = setInterval(fetchComments, 1500);
    return () => {
      clearInterval(detailInterval);
      clearInterval(commentsInterval);
    };
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
        // Wait a moment for backend to process, then fetch fresh data
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchComments();
        await fetchDetail();
        console.log("Comments refreshed after new comment");
      }
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to add comment: " + (error.response?.data?.detail || error.message));
    }
  };

  const addReply = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!replyText.trim() || !replyingTo) {
      console.log("Reply is empty or no parent comment selected");
      return;
    }
    try {
      console.log("Sending reply to comment:", replyingTo);
      const res = await axios.post(`/photos/${photoId}/comments/add/`, { 
        text: replyText,
        parent_comment_id: replyingTo
      });
      console.log("Reply added successfully:", res.data);
      if (res.status === 201 || res.status === 200) {
        setReplyText("");
        setReplyingTo(null);
        // Wait a moment for backend to process, then fetch fresh data
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchComments();
        await fetchDetail();
        console.log("Comments refreshed after reply");
      }
    } catch (error: any) {
      console.error("Failed to add reply:", error);
      alert("Failed to add reply: " + (error.response?.data?.detail || error.message));
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

  const renderCommentTree = (comment: any, level = 0) => {
    return (
      <div key={comment.id}>
        <div 
          style={{ marginLeft: `${level * 12}px` }} 
          className="p-2.5 bg-white/[0.02] rounded-lg text-sm mb-2 border-l-2 border-blue-500/40"
        >
          <div className="font-sans font-medium text-xs flex justify-between items-start gap-2">
            <span className="text-neutral-300">{comment.user_name}</span>
            <span className="text-neutral-600 text-xs whitespace-nowrap">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <div className="mt-1 font-sans text-body text-neutral-400">{comment.text}</div>
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1.5 font-medium font-sans transition-colors"
          >
            Reply
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map((reply: any) => renderCommentTree(reply, level + 1))}
          </div>
        )}
      </div>
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="bg-[#111111] text-white rounded-2xl max-w-4xl w-full overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-serif text-card-title text-[#f0f0f0]">Photo Details</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-600 hover:text-white hover:bg-white/[0.05] transition-all duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:flex-1 bg-black/50 flex items-center justify-center min-h-[60vh] md:min-h-auto">
            <img src={detail?.original_file || photoUrl} alt="photo" className="max-h-[70vh] object-contain" />
          </div>

          <div className="w-full md:w-96 p-4 border-l border-white/[0.06] overflow-y-auto max-h-[70vh]">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button 
                onClick={(e) => toggleLike(e)} 
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-blue-500/10 border border-white/[0.07] hover:border-blue-500/25 rounded-lg transition-all duration-150 font-sans text-btn"
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current text-red-500' : ''}`} />
                <span className="text-sm">{detail?.likes_count ?? 0}</span>
              </button>

              <button 
                onClick={(e) => toggleFavourite(e)} 
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-blue-500/10 border border-white/[0.07] hover:border-blue-500/25 rounded-lg transition-all duration-150 font-sans text-btn"
              >
                <Star className={`w-4 h-4 ${favourited ? 'fill-current text-yellow-500' : ''}`} />
                <span className="text-sm">{detail?.favourites_count ?? 0}</span>
              </button>

              <button 
                onClick={downloadOriginal} 
                disabled={downloading}
                className="btn-primary px-3 py-2 text-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{downloading ? "..." : "Get"}</span>
              </button>

              <button 
                onClick={shareLink} 
                className="btn-secondary px-3 py-2 text-btn"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">{copied ? "✓" : "Share"}</span>
              </button>
            </div>

            {/* Tag section */}
            <div className="mb-4 pb-4 border-b border-white/[0.05]">
              <label className="font-sans text-filter-label text-neutral-600 mb-2 block uppercase">Tag someone</label>
              <div className="flex gap-2">
                <input 
                  value={tagUser} 
                  onChange={(e)=>setTagUser(e.target.value)} 
                  placeholder="Enter email address..." 
                  className="input-field flex-1 text-btn" 
                />
                <button 
                  onClick={tagPerson} 
                  className="btn-primary px-3 py-2 text-btn whitespace-nowrap"
                >
                  Tag
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div className="mb-4 pb-4 border-b border-white/[0.05]">
              <h3 className="font-sans text-filter-label text-neutral-600 mb-3 uppercase">Comments ({comments.length})</h3>
              <div className="max-h-64 overflow-y-auto mb-3 space-y-2">
                {comments.length ? comments.map((c)=> renderCommentTree(c)) : <p className="font-sans text-body text-neutral-600 text-sm">No comments yet</p>}
              </div>

              {replyingTo && (
                <div className="mb-3 p-3 bg-blue-500/[0.06] rounded-lg border border-blue-500/20 text-sm">
                  <div className="font-sans text-filter-label text-blue-300 mb-2">Replying to comment #{replyingTo}</div>
                  <div className="flex gap-2">
                    <input 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      placeholder="Write your reply..." 
                      className="input-field flex-1 text-btn" 
                    />
                    <button 
                      type="button" 
                      onClick={(e) => addReply(e)} 
                      className="btn-primary px-3 py-2 text-btn whitespace-nowrap"
                    >
                      Reply
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setReplyingTo(null); setReplyText(""); }} 
                      className="btn-secondary px-3 py-2 text-btn whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input 
                  value={newComment} 
                  onChange={(e)=>setNewComment(e.target.value)} 
                  placeholder="Add a comment..." 
                  className="input-field flex-1 text-btn" 
                />
                <button 
                  type="button" 
                  onClick={(e) => addComment(e)} 
                  className="btn-primary px-4 py-2 text-btn whitespace-nowrap"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Person tags */}
            {detail?.person_tags?.length > 0 && (
              <div className="mb-4 pb-4 border-b border-white/[0.05]">
                <h4 className="font-sans text-filter-label text-neutral-600 mb-2 uppercase">Tagged people</h4>
                <div className="flex flex-wrap gap-2">
                  {detail?.person_tags.map((t: any) => (
                    <span
                      key={t.id}
                      className="px-2 py-1 text-sm font-sans bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full"
                    >
                      @{t.tagged_user_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tags */}
            {detail?.tags && (
              <div>
                <h4 className="font-sans text-filter-label text-neutral-600 mb-3 uppercase">AI Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(detail.tags)
                    .filter(([_, score]) => Number(score) > 0.05)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 8)
                    .map(([tag]) => (
                      <span
                        key={tag}
                        className="px-3 py-1 font-sans text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full"
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
