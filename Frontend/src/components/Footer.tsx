export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-400">
          
          {/* Left - Copyright */}
          <p className="text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Ascend. All rights reserved.
          </p>

        
          <div className="flex gap-4 sm:gap-6 text-sm">
           
            <a
              href="mailto:ascend7007@gmail.com"
              className="hidden sm:inline hover:text-red-400 transition text-red-500"
            >
              ascend7007@gmail.com
            </a>
            
          
            <a
              href="mailto:ascend7007@gmail.com"
              className="hover:text-white transition"
            >
              Contact
            </a>
            
            
            <a
              href="#"
              className="hidden sm:inline hover:text-white transition"
            >
              Privacy
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
