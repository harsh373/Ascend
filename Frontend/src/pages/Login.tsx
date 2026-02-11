import { SignUp } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <h1 className="text-3xl font-extrabold text-white mb-2">ASCEND</h1>
      <p className="text-zinc-400 mb-6 text-center max-w-xs">
        Create your Arcs and show your journey.
      </p>

      <SignUp
        appearance={{
          elements: {
            card: "bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton:
              "bg-black border border-zinc-700 text-white hover:bg-zinc-800",
            formButtonPrimary:
              "bg-red-600 hover:bg-red-500 text-white font-semibold",
            footerActionText: "text-zinc-400",
            footerActionLink: "text-red-500 hover:text-red-400",
            formFieldInput:
              "bg-black border border-zinc-700 text-white focus:border-red-500",
          },
        }}
      />
    </div>
  );
}
