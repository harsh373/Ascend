import { useEffect, useState, type JSX } from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserProfile, createUser } from "../api/userApi";
import { followArc } from "../api/arcApi";

export default function AuthGate({ children }: { children: JSX.Element }) {
  const { user, isLoaded } = useUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!isLoaded || !user) return;

      try {
        await getUserProfile(user.id);
      } catch {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const username = user.username || user.emailAddresses[0]?.emailAddress.split("@")[0] || user.id.slice(0, 8);

        await createUser(
          user.id,
          username,
          fullName || username,
          user.imageUrl || ""
        );
      }

      const pendingArcId = localStorage.getItem("pendingFollowArcId");
      if (pendingArcId) {
        localStorage.removeItem("pendingFollowArcId");
        try {
          await followArc(pendingArcId, user.id);
        } catch (err) {
          console.error("Auto-follow failed:", err);
        }
        window.location.href = `/arc/${pendingArcId}`;
        return;
      }

      setReady(true);
    };

    check();
  }, [isLoaded, user]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}