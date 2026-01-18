export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">

        {/* Left */}
        <p className="text-sm">
          © {new Date().getFullYear()} Ascend. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-6 text-sm">
          <a
            href="#"
            className="hover:text-white transition"
          >
            About
          </a>
          <a
            href="#"
            className="hover:text-white transition"
          >
            Contact
          </a>
          <a
            href="#"
            className="hover:text-white transition"
          >
            Privacy
          </a>
        </div>

      </div>
    </footer>
  );
}
