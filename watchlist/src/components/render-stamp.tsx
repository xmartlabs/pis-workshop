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
