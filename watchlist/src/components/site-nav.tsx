import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/populares", label: "Populares" },
  { href: "/buscar", label: "Buscar" },
  { href: "/watchlist", label: "Mi watchlist" },
];

export function SiteNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold">
          🎬 Watchlist
        </Link>
        <ul className="flex gap-4 text-sm">
          {links.slice(1).map((link) => (
            <li key={link.href}>
              {/* next/link navega sin recargar la página entera: solo pide
                  la parte que cambia. Con un <a> normal perderias eso. */}
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
