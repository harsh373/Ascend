import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createArc, uploadArcCoverPhoto } from "../api/arcApi";
import { useNavigate } from "react-router-dom";
import { validateImage, compressImage } from "../utils/imageUtils";
import { getErrorMessage } from "../utils/getErrorMessage";

const THEMES = [
  "Fitness",
  "Learning",
  "Career",
  "Creative",
  "Financial"
];

export default function CreateArc() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const compressed = await compressImage(file);
      setCoverFile(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
      setError("");
    } catch (err: unknown) {
  console.error(err);
  setError(getErrorMessage(err));
}
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("User not loaded");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!coverFile) {
      setError("Cover photo is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("cover", coverFile);

      const uploadRes = await uploadArcCoverPhoto(formData);
      const coverPhotoUrl = uploadRes.data.coverPhoto;

      const res = await createArc({
        userId: user.id,
        title: title.trim(),
        theme,
        coverPhoto: coverPhotoUrl
      });

      navigate(`/arc/${res.data.data._id}`);
    } 
  catch (err: unknown) {
  console.error(err);
  setError(getErrorMessage(err));
}
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            New Journey
          </span>
          <h1 className="text-5xl sm:text-7xl font-black text-red-500 mt-2 mb-4">
            CREATE ARC
          </h1>
          <p className="text-zinc-400 text-lg">
            Define your transformation. Track your progress.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Cover Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold hover:file:bg-red-500 file:cursor-pointer"
              />
              {coverPreview && (
                <div className="mt-4">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border border-zinc-700"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Arc Title *
              </label>
              <input
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
                placeholder="Get Shredded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Theme *
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Arc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}