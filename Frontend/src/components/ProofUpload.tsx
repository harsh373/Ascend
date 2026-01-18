import { useState } from "react";
import { uploadChallengeProof } from "../api/challengeApi";

export default function ProofUpload({ challengeId }: { challengeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("challengeId", challengeId);

      await uploadChallengeProof(formData);

      // Refresh UI so status updates
      window.location.reload();
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError("Upload failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 px-3 py-1 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Submit Proof"}
      </button>
    </div>
  );
}
