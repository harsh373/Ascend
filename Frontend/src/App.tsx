import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import { Route, Routes } from "react-router-dom";


import Profile from "./pages/Profile";
import Footer from "./components/Footer";

import Onboarding from "./pages/Onboarding";


import LandingPage from "./pages/LandingPage";


import ReactGA from "react-ga4";


import AuthGate from "./components/AuthGate";




import AnalyticsTracker from "./components/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "./components/ScrollToTop";
import Feed from "./pages/Feed";

import ArcPage from "./pages/ArcPage";
import CreateArc from "./pages/CreateArc";
import Search from "./pages/Search";
import Create from "./pages/Create";
import Settings from "./pages/Settings";

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
              
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            
            
            <Route path="/onboarding" element={<Onboarding />} />
            
            
            <Route path="/create-arc" element={<CreateArc />} />
            <Route path="/arc/:arcId" element={<ArcPage />} />
            <Route path="/search" element ={<Search/>}/>
            <Route path="/create" element={<Create />} />
            <Route path="/settings" element={<Settings />} />
       
     

            
          </Routes>
        </main>
        
        <Footer />
      </SignedIn>
      <Analytics/>


    </div>
  );
}

export default App;
