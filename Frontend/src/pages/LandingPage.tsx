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
              DOCUMENT YOUR<br/>
              <span className="text-red-500">TRANSFORMATION</span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Create arcs. Track progress. Build proof.<br/>
            Your journey, documented.
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
              Why progress disappears
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <PainCard 
              title="Scattered everywhere"
              desc="Your updates live across different apps and platforms. No single place to see your journey."
            />
            <PainCard 
              title="No narrative structure"
              desc="Random updates don't show growth. You can't see how far you've come or where you're going."
            />
            <PainCard 
              title="Progress isn't visible"
              desc="Without a timeline, transformation looks like chaos. You lose sight of what's working."
            />
            <PainCard 
              title="Context gets lost"
              desc="Each update stands alone. The story of your transformation never comes together."
            />
          </div>

          <div className="max-w-3xl mx-auto text-center bg-zinc-950 border-2 border-zinc-900 p-8 sm:p-10">
            <p className="text-xl sm:text-2xl font-black mb-4">The solution:</p>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Build arcs. Track journeys with structure.<br className="hidden sm:block"/>
              Document transformation in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
              How ASCEND works
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <Step 
              num="1"
              title="Create an arc"
              desc="Name your journey. Fitness. Learning. Career. Each arc is a transformation story."
            />
            <Step 
              num="2"
              title="Add updates"
              desc="Document progress with reflections, milestones, failures, proof. Build your timeline."
            />
            <Step 
              num="3"
              title="Follow arcs"
              desc="See real progress from people you care about. Pure growth, pure signal."
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            Stop losing your progress
          </h2>
          
          <p className="text-lg sm:text-xl text-zinc-400">
            Join people who document their transformation
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 hover:bg-red-600 px-10 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-bold transition-colors"
          >
            Start Now
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