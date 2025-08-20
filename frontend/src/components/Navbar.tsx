import Link from "next/link";
import ZaggleLogoAnimation from "./ZaggleLogoAnimation";
import { AiFillHome } from "react-icons/ai";

const Navbar: React.FC = () => {
  return (
    <nav className=" w-full border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-1 pt-1 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-1 lg:dark:bg-zinc-800/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between font-mono text-sm">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="border-4 border-dashed border-gray-300 rounded-lg"
              style={{
                padding: 0,
                margin: 0,
                height: "75px", // Match the height of the parent container
                width: "200px", // Make the width dynamic, it will take the full width of the parent
              }}
            >
              <ZaggleLogoAnimation />
            </div>
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
