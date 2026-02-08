import { useState } from "react";
import { uploadArcUpdateWithImages } from "../api/arcApi";
import { validateImage, compressImage } from "../utils/imageUtils";
import { getErrorMessage } from "../utils/getErrorMessage";

interface AddArcUpdateProps {
  arcId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddArcUpdate({ arcId, onClose, onSuccess }: AddArcUpdateProps) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || []);
  
  // Combine existing files + new files
  const combinedFiles = [...files, ...selectedFiles];
  
  if (combinedFiles.length > 2) {
    setError("Maximum 2 images allowed");
    e.target.value = ""; // Reset input
    return;
  }

  const validFiles: File[] = [];
  const newPreviews: string[] = [];

  // Process ALL files (existing + new)
  for (const file of combinedFiles) {
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    try {
      // Check if already compressed (existing file)
      if (files.includes(file)) {
        validFiles.push(file);
        const existingIndex = files.indexOf(file);
        newPreviews.push(previews[existingIndex]);
      } else {
        // Compress new file
        const compressed = await compressImage(file);
        validFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      }
    } catch (err) {
      
      setError(getErrorMessage(err));
      e.target.value = "";
      return;
    }
  }

  setFiles(validFiles);
  setPreviews(newPreviews);
  setError("");
  e.target.value = ""; // Reset input for next selection
};  

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Text is required");
      return;
    }

    if (text.length > 500) {
      setError("Text must be less than 500 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("arcId", arcId);
      formData.append("type", type);
      formData.append("text", text.trim());

      files.forEach(file => {
        formData.append("images", file);
      });

      await uploadArcUpdateWithImages(arcId, formData);

      onSuccess();
    } catch (err: unknown) {
    console.error(err);
    setError(getErrorMessage(err));
}
 
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Add Update</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Update Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
            >
              <option value="reflection">Reflection</option>
              <option value="milestone">Milestone</option>
              <option value="failure">Failure</option>
              <option value="proof">Proof</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Update Text ({text.length}/500)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition resize-none"
              placeholder="Describe your progress..."
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Images (Max 2)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold hover:file:bg-red-500 file:cursor-pointer"
            />
            
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}