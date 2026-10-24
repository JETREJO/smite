import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-wide text-fg">
          SMITE 2 <span className="text-accent">Builds</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-fg-muted">
          <Link href="/gods/new" className="hover:text-fg">
            Registrar dios
          </Link>
        </nav>
      </div>
    </header>
  );
}
