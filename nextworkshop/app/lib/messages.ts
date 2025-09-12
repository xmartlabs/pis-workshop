import { JSON_SERVER } from "@/next.config";

export type Message = {
  id: number;
  content: string;
  due_date: string;
  is_complete: boolean;
};

export async function getMessages(): Promise<Message[]> {
  try {
    const res = await fetch(`${JSON_SERVER}/messages`, { cache: "no-store" });

    if (!res.ok) {
      console.error("Failed to fetch messages:", await res.text());
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error in getMessages:", error);
    return [];
  }
}
