import { NavLink } from "react-router-dom";

export default function MobileNav() {
  const iconClass =
    "w-6 h-6 opacity-70 group-hover:opacity-100 transition";

  const activeClass = "opacity-100";

  return (
    <>
      {/* Top Profile Icon Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-black border-b border-gray-800 flex justify-end items-center px-4 z-50 sm:hidden">
        <NavLink to="/profile">
          <img
            src="/assets/profile.svg"
            alt="Profile"
            className="w-8 h-8 object-contain"
          />
        </NavLink>
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center py-2 z-50 sm:hidden">

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
