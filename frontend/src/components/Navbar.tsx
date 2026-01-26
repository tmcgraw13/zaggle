import Link from "next/link";
import ZaggleLogoAnimation from "./ZaggleLogoAnimation";
import { AiFillHome } from "react-icons/ai";

const Navbar: React.FC = () => {
  return (
    <nav >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ZaggleLogoAnimation />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <AiFillHome size={28} className="text-blue-600" />
            <span className="sr-only">Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
