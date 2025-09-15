"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-4">
      <SignedOut>
        <p>You are signed out.</p>
        <Link href="/sign-in" className="text-blue-600 underline">
          Sign in
        </Link>
      </SignedOut>

      <SignedIn>
        <UserButton />
        <div className="mt-4">
          <Link
            href="/feed"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Feed
          </Link>
          <Link
            href="/profile"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Profile
          </Link>
          {/* <Link
            href="/friends"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View your notes
          </Link>
          <Link
            href="/private"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View your notes
          </Link>
          <Link
            href="/favorites"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View your notes
          </Link> */}
        </div>
      </SignedIn>
    </main>
  );
}

