import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  const baseLink =
    "relative text-gray-400 hover:text-white transition font-medium px-2 py-1";

  const activeLink =
    "text-white after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-[2px] after:bg-white";

  return (
    <nav className="hidden md:flex w-full bg-black border-b border-gray-800 px-6 py-4 justify-between items-center">

      
      <div className="flex items-center gap-2">
        <img
          src="/assets/logo.png"
          alt="Ascend Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="text-xl font-bold text-red-500 tracking-wide">
          ASCEND
        </span>
      </div>

      
      <div className="flex items-center gap-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${baseLink} ${activeLink}` : baseLink
          }
        >
          Feed
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? `${baseLink} ${activeLink}` : baseLink
          }
        >
          Search
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) =>
            isActive ? `${baseLink} ${activeLink}` : baseLink
          }
        >
          Create
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? `${baseLink} ${activeLink}` : baseLink
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? `${baseLink} ${activeLink}` : baseLink
          }
        >
          Settings
        </NavLink>
      </div>

    
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />
    </nav>
  );
}