import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getUserArcs } from "../api/arcApi";
import AddArcUpdate from "../components/AddArcUpdate";

interface Arc {
  _id: string;
  title: string;
  theme: string;
  coverPhoto: string;
  archived: boolean;
}

export default function Create() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  const [arcs, setArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    
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
  }, [isLoaded, userId]);

  const handleUpdateSuccess = () => {
    setSelectedArcId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-4xl mx-auto">

        <section className="mb-10">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Creator Studio
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 mb-4">
            CREATE
          </h1>

          <p className="text-zinc-400 text-lg">
            What do you want to work on right now?
          </p>
        </section>

        {arcs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-7xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Start your first arc
            </h2>
            <p className="text-zinc-400 mb-8 text-center max-w-md">
              Arcs are transformation journeys. Create one to start documenting your progress.
            </p>
            <button
              onClick={() => navigate("/create-arc")}
              className="bg-red-600 hover:bg-red-500 px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              + Create New Arc
            </button>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Add an Update</h2>

              <div className="space-y-4">
                {arcs.map((arc) => (
                  <div
                    key={arc._id}
                    onClick={() => navigate(`/arc/${arc._id}`)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-5 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 cursor-pointer transition-all duration-200 group"
                  >
                    <img
                      src={arc.coverPhoto}
                      alt={arc.title}
                      className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 group-hover:border-red-500 transition"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-lg group-hover:text-red-400 transition">
                        {arc.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {arc.theme} · Journey updates
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArcId(arc._id);
                      }}
                      className="bg-red-600 hover:bg-red-500 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-8 border-t border-zinc-800">
              <button
                onClick={() => navigate("/create-arc")}
                className="w-full bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl p-6 flex items-center justify-center gap-3 font-bold text-lg text-zinc-400 hover:text-red-400 transition-all duration-200 group"
              >
                <svg
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Arc
              </button>
            </section>
          </>
        )}

        {selectedArcId && (
          <AddArcUpdate
            arcId={selectedArcId}
            onClose={() => setSelectedArcId(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </div>
  );
}