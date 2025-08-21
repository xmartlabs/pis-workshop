// src/pages/homes/home.tsx
import { useEffect, useState } from "react";
import { MessageController } from "networking/controllers/message-controller";

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // we need add this below the other useState
  const [content, setContent] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [isComplete, setIsComplete] = useState(false);
  const [idLastMessage, setIdLastMessage] = useState<string>("");

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      const response = await MessageController.getMessages();
      setMessages(response);
    };
    fetch().catch(console.error);
  }, []);

  // under useEffect add:
  const validValues = content && dueDate;

  const handleSubmit = async (e: any) => {
        e.preventDefault();

    if (idLastMessage && content && dueDate) {
      const newMessage = await MessageController.createMessage({
        id: idLastMessage.toString(),
        content,
        dueDate: new Date(dueDate),
        isComplete,
      });

      setIdLastMessage(String(Number(idLastMessage) + 1));
      setMessages((prevState) => [...prevState, newMessage]);

      setContent("");
      setIsComplete(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-semibold text-neutral-900">Messages</h2>

        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex flex-row items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="text-neutral-800">
                [{m.isComplete ? "✅" : "❌"}] {m.content}
              </div>
              <div className="text-sm text-neutral-500">
                {m.dueDate.toLocaleDateString("en-US")}
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="id" className="text-sm text-neutral-700">
                Id
              </label>
              <input
                id="id"
                name="id"
                value={idLastMessage}
                onChange={(e) => { setIdLastMessage(e.target.value); }}
                className="h-9 rounded-md border border-neutral-300 px-3 text-sm text-neutral-800 outline-none focus:border-neutral-500"
                placeholder="e.g. 1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="content" className="text-sm text-neutral-700">
                Content
              </label>
              <input
                id="content"
                name="content"
                value={content ?? ""}
                onChange={(e) => { setContent(e.target.value); }}
                className="h-9 rounded-md border border-neutral-300 px-3 text-sm text-neutral-800 outline-none focus:border-neutral-500"
                placeholder="Write a message…"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="due_date" className="text-sm text-neutral-700">
                Due date:
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={dueDate ?? ""}
                onChange={(e) => { setDueDate(e.target.value); }}
                className="h-9 rounded-md border border-neutral-300 px-3 text-sm text-neutral-800 outline-none focus:border-neutral-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_complete"
                name="is_complete"
                checked={isComplete}
                onChange={() => { setIsComplete((prev) => !prev); }}
                className="h-4 w-4 accent-neutral-800"
              />
              <label htmlFor="is_complete" className="text-sm text-neutral-700">
                Is completed?
              </label>
            </div>

            <button
              type="submit"
              disabled={!validValues}
              className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-white ${
                validValues
                  ? "bg-neutral-900 hover:bg-neutral-800"
                  : "bg-neutral-300 cursor-not-allowed"
              }`}
            >
              Save message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export { Home };
