import { useNavigate } from "react-router-dom";

interface FollowedArc {
  _id: string;
  title: string;
  theme: string;
  coverPhoto: string;
}

interface FollowedArcsModalProps {
  arcs: FollowedArc[];
  onClose: () => void;
}

export default function FollowedArcsModal({ arcs, onClose }: FollowedArcsModalProps) {
  const navigate = useNavigate();

  const handleArcClick = (arcId: string) => {
    navigate(`/arc/${arcId}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Following Arcs</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
          {arcs.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              Not following any arcs yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {arcs.map((arc) => (
                <div
                  key={arc._id}
                  onClick={() => handleArcClick(arc._id)}
                  className="p-4 hover:bg-zinc-800 transition cursor-pointer flex items-center gap-4"
                >
                  <img
                    src={arc.coverPhoto}
                    alt={arc.title}
                    className="w-16 h-16 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{arc.title}</h3>
                    <p className="text-sm text-zinc-400">{arc.theme}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}