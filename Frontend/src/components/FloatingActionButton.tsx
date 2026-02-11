import { useState } from "react";
import { useScrollDirection } from "../utils/useScrollDirection";
import ArcSelectionSheet from "./ArcSelectionSheet";
import AddArcUpdate from "./AddArcUpdate";

interface FloatingActionButtonProps {
  userId: string;
  onUpdateSuccess?: () => void;
}

export default function FloatingActionButton({ userId, onUpdateSuccess }: FloatingActionButtonProps) {
  const scrollingDown = useScrollDirection();
  const [showArcSheet, setShowArcSheet] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);

  const handleSelectArc = (arcId: string) => {
    setSelectedArcId(arcId);
    setShowArcSheet(false);
    setShowComposer(true);
  };

  const handleUpdateSuccess = () => {
    setShowComposer(false);
    setSelectedArcId(null);
    
    if (onUpdateSuccess) {
      onUpdateSuccess();
    } else {
   
      window.location.reload();
    }
  };

  return (
    <>
     
      <button
        onClick={() => setShowArcSheet(true)}
        className={`fixed bottom-20 right-6 w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl font-bold transition-all duration-200 ease-in-out active:scale-95 z-30 ${
          scrollingDown ? 'opacity-0 translate-y-5 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        aria-label="Add update"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

    
      {showArcSheet && (
        <ArcSelectionSheet
          userId={userId}
          onClose={() => setShowArcSheet(false)}
          onSelectArc={handleSelectArc}
        />
      )}

     
      {showComposer && selectedArcId && (
        <AddArcUpdate
          arcId={selectedArcId}
          onClose={() => {
            setShowComposer(false);
            setSelectedArcId(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}