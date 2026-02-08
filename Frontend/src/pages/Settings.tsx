import { useUser, UserButton, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-2xl mx-auto">

        <section className="mb-8">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Account
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 mb-4">
            SETTINGS
          </h1>

          <p className="text-zinc-400 text-lg">
            Manage your account and preferences
          </p>
        </section>

        <div className="space-y-4">

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
              Profile Info
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={user?.imageUrl || "/assets/user.png"}
                alt={user?.fullName || "User"}
                className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover"
              />
              <div>
                <p className="font-semibold text-lg">{user?.fullName}</p>
                <p className="text-sm text-zinc-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
              Account Management
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white mb-1">Manage Account</p>
                <p className="text-sm text-zinc-500">
                  Update password, email, and authentication
                </p>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
              About
            </h2>

            <div>
              <p className="font-semibold text-lg text-white mb-2">Ascend</p>
              <p className="text-sm text-zinc-400">
                Document your transformation. Track progress through arcs.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold text-lg transition"
          >
            Log out
          </button>

        </div>
      </div>
    </div>
  );
}