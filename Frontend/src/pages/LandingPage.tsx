import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="absolute top-0 left-0 w-1 h-32 bg-red-500"></div>
        <div className="absolute bottom-0 right-0 w-1 h-32 bg-red-500"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              YOUR LIFE HAS<br/>
              <span className="text-red-500">ARCS.</span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Every transformation you go through is a story with a beginning, a middle, and an end.<br/>
            Ascend is the only place built to capture it that way.
          </p>

          <div className="pt-6">
            <button
              onClick={() => navigate("/login")}
              className="bg-red-500 hover:bg-red-600 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold transition-colors"
            >
              Start Your Arc
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
              Updates aren't enough
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <PainCard
              title="A post is a moment."
              desc="It has no before. No after. No shape. It disappears into a feed and means nothing six months later."
            />
            <PainCard
              title="A journal is private forever."
              desc="Growth without witnesses has no weight. The people who matter to you never see what you're going through."
            />
            <PainCard
              title="A story needs structure."
              desc="Where did you start? What broke you? What changed? Without structure, transformation looks like noise."
            />
            <PainCard
              title="No one knows you're growing."
              desc="The people who matter to you have no idea what you're going through. Your transformation is invisible to them."
            />
          </div>

          <div className="max-w-3xl mx-auto text-center bg-zinc-950 border-2 border-zinc-900 p-8 sm:p-10">
            <p className="text-xl sm:text-2xl font-black mb-4">An arc is different.</p>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              It has a name. A theme. A timeline of updates that build into something real.<br className="hidden sm:block"/>
              It ends when you decide it ends. And it lives as proof of who you became.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
              How an arc works
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <Step
              num="1"
              title="Create an arc"
              desc="Name your journey. Give it a theme. That's the beginning. Every transformation deserves one."
            />
            <Step
              num="2"
              title="Document as you go"
              desc="Add reflections, milestones, and progress. Each update becomes part of a timeline only you control."
            />
            <Step
              num="3"
              title="Choose who witnesses it"
              desc="Invite the people who deserve to see your becoming. They follow and see your Arc"
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            You're already in one.
          </h2>

          <p className="text-lg sm:text-xl text-zinc-400">
            The question is whether you're documenting it.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 hover:bg-red-600 px-10 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-bold transition-colors"
          >
            Start Your Arc
          </button>
        </div>
      </section>

    </div>
  );
}

function PainCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-zinc-950 border-2 border-zinc-900 p-6 sm:p-8 h-full">
      <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-red-500">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-zinc-950 border-2 border-zinc-900 p-6 sm:p-8 h-full">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 text-black font-black text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center justify-center">
        {num}
      </div>
      <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">{desc}</p>
    </div>
  );
}