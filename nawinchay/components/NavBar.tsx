// Navbar compartida. Reemplaza las navs inline que cada vista tenia por su
// cuenta, para que las rutas se lean como un producto y no como paginas sueltas.
//
// Todos los enlaces son <a> normales, no next/link, a proposito: /crear es un
// HTML estatico servido desde public/ y queda FUERA del router de Next. Con
// next/link la navegacion de cliente intentaria resolverlo como ruta del router
// y no cargaria. Un <a> hace navegacion completa y funciona para las cinco.

const ENLACES = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/priorizacion", etiqueta: "Priorizacion" },
  { href: "/items", etiqueta: "Items" },
  { href: "/historico", etiqueta: "Historico" },
  { href: "/crear", etiqueta: "Crear" },
] as const;

export default function NavBar({ actual }: { actual?: string }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-widest">
      {ENLACES.map((e) =>
        e.href === actual ? (
          <span key={e.href} className="text-brand-green">
            {e.etiqueta}
          </span>
        ) : (
          <a key={e.href} href={e.href} className="text-neutral-500 hover:text-white">
            {e.etiqueta}
          </a>
        )
      )}
    </nav>
  );
}
