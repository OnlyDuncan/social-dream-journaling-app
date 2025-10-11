"use client";

// Stylization changes to landing page
// Change all instances of "notes" to "dreams" in the codebase
// Add loading screen / spinners / bars
// Get it to be responsive on other devices

import { SignedIn, SignedOut, SignOutButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Box, } from "@mui/material";

export default function HomePage() {
  return (
    <main className="">
      <Box
        sx={{
          backgroundColor: "#8E7499",
          paddingLeft: 2,
          paddingRight: 2, 
          paddingTop: 2,
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            backgroundImage: "url('/noah-buscher---kD6McW60I-unsplash.jpg')",
            backgroundSize: "cover",
            padding: 4,
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Reverie
            </h1>
            <h2 className="text-2xl font-semibold mt-2 ml-5 text-white">
              Dream Journal
            </h2>
          </Box>

          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-36 text-center">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Box className="mt-4" sx={{ display: "flex", flexDirection: "column" }}>
              <Link
                href="/feed"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-36 mb-5 text-center"
              >
                Feed
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-36 mb-5 text-center"
              >
                Profile
              </Link>
              <SignOutButton>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-36 text-center">
                  Sign Out
                </button>
              </SignOutButton>
            </Box>
          </SignedIn>

          <div 
            className="text-white"
            style={{ marginTop: "auto", alignSelf: "flex-end" }}
          >
            Sink into the sunless sea
          </div>
        </Box>
      </Box>
    </main>
  );
}

