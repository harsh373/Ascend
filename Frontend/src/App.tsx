import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import { Route, Routes } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Approvals from "./pages/Approvals";
import Onboarding from "./pages/Onboarding";
import Challenges from "./pages/Challenges";
import AllTasks from "./pages/AllTasks";
import LandingPage from "./pages/LandingPage";

import AuthGate from "./components/AuthGate";
import ManageHabits from "./pages/ManageHabits";

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col w-full overflow-x-hidden">

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
                  <Home />
                </AuthGate>
              }
            />

            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/manage-habits" element={<ManageHabits />} />
       
     

            <Route path="/challenges" element={<Challenges />} />
            <Route path="/tasks" element={<AllTasks />} />
          </Routes>
        </main>

        <Footer />
      </SignedIn>

    </div>
  );
}

export default App;
