import { useState, useEffect } from "react";
import { IComment } from "./IComment";
import { commentAPI } from "./CommentAPI";
import { useUserContext } from "../App";
import toast from "react-hot-toast";

interface CommentSectionProps {
  requestId: number;
  onCountChange: (count: number) => void;
}

function CommentSection({ requestId, onCountChange }: CommentSectionProps) {
  const { user } = useUserContext();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState("");

  useEffect(() => {
    loadComments();
  }, [requestId]);

  async function loadComments() {
    try {
      const data = await commentAPI.list(requestId);
      setComments(data);
      onCountChange(data.length);
    } catch (error) {
      toast.error("Could not load comments.");
    }
  }
  async function handleAddComment() {
    if (!newCommentBody.trim() || !user || !user.id) return;

    try {
      const comment: IComment = {
        body: newCommentBody,
        requestId: requestId,
        userId: user.id,
      };
      await commentAPI.post(comment);
      setNewCommentBody("");
      loadComments();
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment.");
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    try {
      await commentAPI.delete(id);
      loadComments();
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error("Failed to delete comment.");
    }
  }

  return (
    <div className="bg-body-tertiary p-4 rounded-4 mt-4 mb-5">
      <h5 className="mb-4 text-secondary">Comments</h5>

      <div className="mb-4">
        {comments.map((c) => (
          <div key={c.id} className="border-bottom pb-3 mb-3">
            <div className="d-flex justify-content-between mb-1">
              <div>
                <strong>
                  {c.user?.firstName} {c.user?.lastName}
                </strong>
                <span className="text-body-secondary ms-3 small">{c.createdAt ? new Date(c.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : ""}</span>
              </div>

              {/* ✨ Only shows Delete if the signed-in user wrote it! */}
              {user?.id === c.userId && (
                <button onClick={() => handleDelete(c.id)} className="btn btn-link text-secondary p-0 text-decoration-none small">
                  Delete
                </button>
              )}
            </div>
            <div>{c.body}</div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-secondary small">No comments yet.</p>}
      </div>

      <div>
        <textarea className="form-control mb-3" rows={3} placeholder="Add a comment..." value={newCommentBody} onChange={(e) => setNewCommentBody(e.target.value)} maxLength={500} />
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleAddComment} disabled={!newCommentBody.trim()}>
            Add comment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
