import { createMessage } from "./actions";

// app/page.tsx
type Message = {
  id: number;
  content: string;
  due_date: string;
  is_complete: boolean;
};

export default async function Home() {
  const res = await fetch("http://localhost:3001/messages", {
    cache: "no-store",
  });
  const messages: Message[] = await res.json();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Messages</h2>
      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className="flex justify-between rounded-lg border p-4 bg-white shadow-sm"
          >
            <div>[{m.is_complete ? "✅" : "❌"}] {m.content}</div>
            <div className="text-sm text-neutral-500">
              {new Date(m.due_date).toLocaleDateString("en-US")}
            </div>
          </div>
        ))}
      </div>
      <form action={createMessage} className="mt-8 space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <input type="text" name="content" placeholder="Message content" className="w-full rounded-md border px-3 py-2" />
        <input type="date" name="due_date" className="w-full rounded-md border px-3 py-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_complete" /> Is completed?
        </label>
        <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2">Save message</button>
      </form>
    </div>
  );
}