import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import CommentItem from "./CommentItem";

interface Comment {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface CommentPanelProps {
  isOpen: boolean;
  comments: Comment[];
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const placeholders = [
  "Write a reply…",
  "Say something…",
  "Respond…",
  "Share a thought…"
];

export default function CommentPanel({
  isOpen,
  comments,
  onClose,
  onSubmit
}: CommentPanelProps) {
  const [text, setText] = useState("");
  const [placeholder] = useState(() => 
    placeholders[Math.floor(Math.random() * placeholders.length)]
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 transition-transform duration-200 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 shrink-0">
          <h3 className="text-lg font-bold text-white">Comments</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {sortedComments.length === 0 ? null : (
            sortedComments.map((comment, idx) => (
              <div
                key={comment._id || idx}
                className="animate-fade-in"
                style={{
                  animation: "fadeIn 180ms ease-out"
                }}
              >
                <CommentItem
                  userId={comment.userId}
                  userName={comment.userName}
                  userAvatar={comment.userAvatar}
                  text={comment.text}
                  createdAt={comment.createdAt}
                />
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-500"
              style={{
                minHeight: "48px",
                maxHeight: "120px"
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition shrink-0 ${
                text.trim()
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}