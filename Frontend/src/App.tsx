import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Approvals from "./pages/Approvals";
import Onboarding from "./pages/Onboarding";
import Challenges from "./pages/Challenges";
import AllTasks from "./pages/AllTasks"
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <SignedOut>
       <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      
      </SignedOut>

      <SignedIn>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/tasks" element={<AllTasks />} />
        </Routes>
        <Footer/>
        
      </SignedIn>
    </div>
  );
}

export default App;
