import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import { Route, Routes } from "react-router-dom";

import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Approvals from "./pages/Approvals";
import Onboarding from "./pages/Onboarding";
import Challenges from "./pages/Challenges";
import AllTasks from "./pages/AllTasks";
import LandingPage from "./pages/LandingPage";


import ReactGA from "react-ga4";


import AuthGate from "./components/AuthGate";
import ManageHabits from "./pages/ManageHabits";
import ChallengeHistory from "./pages/ChallengeHistory";

import UserChallenges from "./pages/UserChallenges";
import UserTasks from "./pages/UserTasks";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "./components/ScrollToTop";
import Feed from "./pages/Feed";
import Habits from "./pages/Habits";

ReactGA.initialize(import.meta.env.VITE_GA_ID);

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col w-full overflow-x-hidden">
      <AnalyticsTracker /> 
      <ScrollToTop />

      <SignedOut>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </SignedOut>

      <SignedIn>
        <Navbar />
        <MobileNav />

        <main className="flex-1 w-full px-3 sm:px-6 max-w-full pt-12 pb-16">
          <Routes>

            {/* HOME — only for onboarded users */}
            <Route
              path="/"
              element={
                <AuthGate>
                  <Feed/>
                
                </AuthGate>
              }
            />
            <Route
              path="/habits"
              element={
                <AuthGate>
                    <Habits/>
                </AuthGate>
              }
            />

            
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/:userId/tasks" element={<UserTasks />} />
            <Route path="/profile/:userId/challenges" element={<UserChallenges />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/manage-habits" element={<ManageHabits />} />
            <Route path="/challenges/history" element={<ChallengeHistory />} />
       
     

            <Route path="/challenges" element={<Challenges />} />
            <Route path="/tasks" element={<AllTasks />} />
          </Routes>
        </main>
        
        <Footer />
      </SignedIn>
      <Analytics/>


    </div>
  );
}

export default App;
