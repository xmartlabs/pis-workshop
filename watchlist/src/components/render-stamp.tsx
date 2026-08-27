// Este componente es la pieza didactica central del workshop.
//
// Muestra el momento exacto en que se renderizo el HTML. Como corre en el
// server, el valor que ves depende de CUANDO se genero la pagina:
//
//   - Pagina estatica (SSG): se congela en el momento del build.
//   - Pagina dinamica (SSR): cambia en cada recarga.
//
// Abri dos pestanas, una en /populares y otra en /buscar, y apreta F5 en las
// dos. Solo una cambia.

export function RenderStamp({ mode }: { mode: "SSG" | "ISR" | "SSR" }) {
  const now = new Date().toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const explicacion = {
    SSG: "generado una vez, en el build",
    ISR: "generado en el build, se regenera cada 1 hora",
    SSR: "generado recien, en este request",
  }[mode];

  return (
    <p className="text-muted-foreground font-mono text-xs">
      <span className="text-foreground font-semibold">{mode}</span>
      {" · HTML "}
      {explicacion}
      {" · "}
      {now}
    </p>
  );
}
