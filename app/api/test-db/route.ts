// /app/api/test-db/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    return new Response(JSON.stringify(user));
  } catch (err) {
    return new Response("Error: " + err, { status: 500 });
  }
}
