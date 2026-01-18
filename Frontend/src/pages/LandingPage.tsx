import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Red accent bars */}
        <div className="absolute top-0 left-0 w-1 h-32 bg-red-500"></div>
        <div className="absolute bottom-0 right-0 w-1 h-32 bg-red-500"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight">
              BUILD DISCIPLINE<br/>
              THROUGH <span className="text-red-500">COMPETITION</span>
            </h1>
          </div>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Track your daily tasks. Compete with friends.<br/>
            Finally stay consistent.
          </p>

          <div className="pt-6">
            <button
              onClick={() => navigate("/login")}
              className="bg-red-500 hover:bg-red-600 px-10 py-4 text-lg font-bold transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              Why you keep failing
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            <PainCard 
              title="You're doing it alone"
              desc="No one sees when you quit. No one cares if you succeed. There's zero social pressure."
            />
            <PainCard 
              title="No real accountability"
              desc="You promise yourself you'll change. You break that promise. Then you do it again tomorrow."
            />
            <PainCard 
              title="Motivation fades fast"
              desc="You're pumped on day one. By day three, you're making excuses. By week two, you've quit."
            />
            <PainCard 
              title="Progress is invisible"
              desc="You can't see if you're improving. You don't know if you're ahead or behind. So you give up."
            />
          </div>

          <div className="max-w-3xl mx-auto text-center bg-zinc-950 border-2 border-zinc-900 p-10">
            <p className="text-2xl font-black mb-4">The solution:</p>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Make your progress visible. Make it competitive.<br className="hidden sm:block"/>
              Make quitting embarrassing.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              How ASCEND works
            </h2>
            <div className="h-0.5 w-16 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Step 
              num="1"
              title="Create tasks"
              desc="Add your daily habits and goals. Each task has XP value."
            />
            <Step 
              num="2"
              title="Add friends"
              desc="Connect with people who are also trying to improve. See their progress."
            />
            <Step 
              num="3"
              title="Compete daily"
              desc="Complete tasks, earn XP, level up. Climb the leaderboard or fall behind."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black">
            Stop quitting on yourself
          </h2>
          
          <p className="text-xl text-zinc-400">
            Join people who are done with excuses
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 hover:bg-red-600 px-12 py-4 text-lg font-bold transition-colors"
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
    <div className="bg-zinc-950 border-2 border-zinc-900 p-8 h-full">
      <h3 className="text-xl font-black mb-4 text-red-500">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-base">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-zinc-950 border-2 border-zinc-900 p-8 h-full">
      <div className="w-12 h-12 bg-red-500 text-black font-black text-2xl mb-6 flex items-center justify-center">
        {num}
      </div>
      <h3 className="text-2xl font-black mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}