# Next.js Workshop

## Setting up the project

### Install Node and NPM
As with React, we need Node and NPM. Use your version manager (`nvm`, `nodenv`, `asdf`) to install the right version:

```sh
nodenv install 22.19.0
npm i -g npm@10.9.3
```

## Create a Next.js app

We will use the official Next.js CLI:

```sh
npx create-next-app@latest nextworkshop
```

When prompted, enable TypeScript, Tailwind, and App Router.

✔ Would you like to use TypeScript? › Yes (ESLint)  <br>
✔ Would you like to use Tailwind CSS? › Yes  <br>
✔ Would you like to use App Router? › Yes  <br>
✔ Would you like your code inside a `src/` directory? Yes <br>
✔ Would you like to customize the default import alias? › No  <br>

Run the project:

```sh
cd nextworkshop
npm run dev
```

And go to http://localhost:3000.


## Migrating from React to Next.js

### Pages and Routing

In React we had a Home.tsx inside src/pages/home.
In Next.js with App Router, pages live inside the app/ folder.

```ts
// app/page.tsx
export default function Home() {
  return <h1>Hello Next.js!</h1>
}
```


### API Endpoints
In React we used json-server directly.
In Next.js we can create our own API route to proxy requests.


```ts
// app/api/messages/route.ts
import { NextResponse } from "next/server";

const JSON_SERVER = "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${JSON_SERVER}/messages`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}
```
Now we can call /api/messages instead of hitting json-server directly.

## Fetching Data (Server Components)
In Next.js, components are Server Components by default.
That means we can fetch data directly inside the component.

```ts
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
            <div className="text-black">
              [{m.is_complete ? "✅" : "❌"}] {m.content}
            </div>
            <div className="text-sm text-neutral-500">
              {new Date(m.due_date).toLocaleDateString("en-US")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Creating Data with Forms
Now, we create a server form to add messages to our database.

```ts
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

```
And now we add the form and make it use the actions.

```ts
// app/page.tsx (add below the list)
<form action="{createMessage}" className="mt-8 space-y-4 bg-white p-6 rounded-lg shadow-sm border">
  <input
    type="text"
    name="content"
    placeholder="Message content"
    className="w-full rounded-md border px-3 py-2"
  />
  <input
    type="date"
    name="due_date"
    className="w-full rounded-md border px-3 py-2"
  />
  <label className="flex items-center gap-2">
    <input type="checkbox" name="is_complete" /> Is completed?
  </label>
  <button
    type="submit"
    className="bg-neutral-900 text-white rounded-md px-4 py-2"
  >
    Save message
  </button>
</form>

```

When you submit, the form will send a POST request to /api/messages.
After refreshing, the new message will appear in the list.


## Key Differences from React

**Routing:** file-based, no react-router.  <br>
**Server Components:** fetch data directly inside components.  <br>
**API Routes:** backend endpoints live next to your frontend code.  <br>
**Forms:** connect directly to server actions or endpoints.  <br>