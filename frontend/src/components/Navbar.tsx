import Link from "next/link";
import ZaggleLogoAnimation from "./ZaggleLogoAnimation";
import { AiFillHome } from "react-icons/ai";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center justify-between px-3 py-2">
        <Link href="/" className="flex items-center">
          <ZaggleLogoAnimation />
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          aria-label="Home"
        >
          <AiFillHome size={22} className="text-indigo-400" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
