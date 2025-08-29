// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createMessage(formData: FormData) {
  const payload = {
    content: String(formData.get("content") ?? ""),
    due_date: String(formData.get("due_date") ?? ""),
    is_complete: formData.get("is_complete") === "on",
  };

  await fetch("http://localhost:3001/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  revalidatePath("/");
}
