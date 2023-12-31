import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);


  // check if API request was made by user
  if (!userId) {
    return new Response("Not authenticated", { status: 401 });
  }

  const fileName = process.cwd() + "/test-data.json";
  const file = await fs.readFile(fileName, "utf8");
  const fileData = JSON.parse(file);
  const notesData = fileData.notes;
  const data = await request.json();
  const newNote = {
    id: data.noteId,
    title: data.title,
    description: data.description,
    "last-updated": data["last-updated"],
  };
  notesData.push(newNote);

  console.log("revalidating...");
  // I dont think this works (have to refresh to see changes)
  revalidatePath("/notes");

  fs.writeFile(fileName, JSON.stringify(fileData, null, 2));
  return new Response("Successfully created new note", { status: 200 });
}
