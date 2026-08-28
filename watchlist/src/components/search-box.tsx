"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("q") ?? "");

  function buscar(evento: React.FormEvent) {
    evento.preventDefault();
    router.push(`/buscar?q=${encodeURIComponent(valor)}`);
  }

  return (
    <form onSubmit={buscar} className="flex max-w-md gap-2">
      <Input
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        placeholder="Título de una película…"
      />
      <Button type="submit">Buscar</Button>
    </form>
  );
}
