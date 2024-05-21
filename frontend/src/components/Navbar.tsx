import Image from "next/image";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between font-mono text-sm">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority={true} // Use "priority" correctly
              style={{ width: "auto", height: "auto" }} // Ensure aspect ratio is maintained
            />
            <span className="font-bold">Zaggle</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-blue-500 transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/test" className="hover:text-blue-500 transition-colors">
            Test
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
