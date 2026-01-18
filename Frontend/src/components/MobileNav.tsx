import { NavLink, useLocation } from "react-router-dom";

export default function MobileNav() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const iconClass =
    "w-7 h-7 opacity-60 filter invert brightness-200 group-hover:opacity-100 transition-transform duration-200";

  const activeClass = "opacity-100 scale-110";

  return (
    <>
      
      <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-gray-800 flex items-center px-4 z-50 md:hidden">

        
        {!isHome && (
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo.png"
              alt="Ascend"
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold text-red-500">ASCEND</span>
          </div>
        )}

        
        <NavLink to="/profile" className="ml-auto">
          <img
            src="/assets/profile.svg"
            alt="Profile"
            className="w-9 h-9 object-contain filter invert brightness-200"
          />
        </NavLink>
      </div>

    
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-gray-800 flex justify-around items-center z-50 md:hidden">

        <NavLink to="/" className="group">
          {({ isActive }) => (
            <img
              src="/assets/home.svg"
              className={`${iconClass} ${isActive ? activeClass : ""}`}
              alt="Home"
            />
          )}
        </NavLink>

        <NavLink to="/challenges" className="group">
          {({ isActive }) => (
            <img
              src="/assets/challenges.svg"
              className={`${iconClass} ${isActive ? activeClass : ""}`}
              alt="Challenges"
            />
          )}
        </NavLink>

        <NavLink to="/friends" className="group">
          {({ isActive }) => (
            <img
              src="/assets/friends.svg"
              className={`${iconClass} ${isActive ? activeClass : ""}`}
              alt="Friends"
            />
          )}
        </NavLink>

        <NavLink to="/leaderboard" className="group">
          {({ isActive }) => (
            <img
              src="/assets/leaderboard.png"
              className={`${iconClass} ${isActive ? activeClass : ""}`}
              alt="Leaderboard"
            />
          )}
        </NavLink>

      </div>
    </>
  );
}
