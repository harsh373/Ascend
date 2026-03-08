import { useNavigate } from "react-router-dom";

interface SignupPromptModalProps {
  arcId: string;
  onClose: () => void;
}

export default function SignupPromptModal({ arcId, onClose }: SignupPromptModalProps) {
  const navigate = useNavigate();

  const handleSignup = () => {
    localStorage.setItem("pendingFollowArcId", arcId);
    navigate("/login");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-8 flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-zinc-700 rounded-full sm:hidden" />

        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-2">Join the journey</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign up to follow this arc and witness every step of this transformation.
          </p>
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition text-base"
        >
          Sign up to Ascend
        </button>

        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-400 text-sm transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}