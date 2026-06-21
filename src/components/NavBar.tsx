import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
// AccountMenu is hidden until the premium tier ships — re-add <AccountMenu />
// below once accounts/favorites are part of the live product.
// import AccountMenu from "./AccountMenu";

export default function NavBar() {
  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3">
        <Link href="/" className="group flex flex-none items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 2v1.5l4-1 4 1V21l-2.5-2v-5.5l8 2.5z" />
            </svg>
          </span>
          <span className="font-display gradient-text text-lg font-bold tracking-tight">
            FlightLen
          </span>
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-md" />
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
          <Link href="/" className="relative transition-colors hover:text-brand-600 dark:hover:text-brand-300">
            Live Map
          </Link>
          <Link href="/airports" className="relative transition-colors hover:text-brand-600 dark:hover:text-brand-300">
            Airports
          </Link>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
