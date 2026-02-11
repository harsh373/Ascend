import { useEffect, useState } from "react";
import { getUserArcs } from "../api/arcApi";

interface Arc {
  _id: string;
  title: string;
  theme: string;
  coverPhoto: string;
  archived: boolean;
  updates?: Array<{
    _id: string;
    type: string;
    text: string;
    images?: string[];
    createdAt: string;
  }>;
  updatedAt?: string;
}

interface ArcSelectionSheetProps {
  userId: string;
  onClose: () => void;
  onSelectArc: (arcId: string) => void;
}

export default function ArcSelectionSheet({ userId, onClose, onSelectArc }: ArcSelectionSheetProps) {
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArcs = async () => {
      try {
        setLoading(true);
        const res = await getUserArcs(userId);
        const allArcs = res.data.data || res.data || [];
        setArcs(allArcs.filter((arc: Arc) => !arc.archived));
      } catch (err) {
        console.error("Failed to load arcs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArcs();
  }, [userId]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onClose}
      />

      
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl z-50 h-[60vh] animate-slide-up">
        <div className="p-6 h-full flex flex-col">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Select Arc</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-zinc-400">Loading arcs...</p>
              </div>
            ) : arcs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-5xl mb-4">🎯</div>
                <p className="text-zinc-400 text-center">No arcs yet. Create one first!</p>
              </div>
            ) : (
              arcs.map((arc) => (
                <div
                  key={arc._id}
                  onClick={() => onSelectArc(arc._id)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-red-500 cursor-pointer transition-all duration-200 group"
                >
                  <img
                    src={arc.coverPhoto}
                    alt={arc.title}
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 group-hover:border-red-500 transition shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition truncate">
                      {arc.title}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate">
                      {arc.theme}
                      {arc.updates && arc.updates.length > 0 && ` · ${arc.updates.length} update${arc.updates.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <svg
                    className="w-5 h-5 text-zinc-600 group-hover:text-red-500 transition shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}