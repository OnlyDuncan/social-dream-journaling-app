"use client";

// Maybe add some arrows to go left and right through the array when in modal form
// Make page reload after accepting or rejecting a friend request

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Box } from "@mui/material";
import DreamModal from "../../components/DreamModal";
import DreamCard from "../../components/DreamCard";
import FriendRequestCard from "../../components/FriendRequestCard";
import FriendCard from "../../components/FriendCard";
import CreateDreamModal from "../../components/CreateDreamModal";

type Tag = {
  id: string;
  name: string;
};

type Note = {
  id: string;
  user: {
    username: string;
  };
  title: string;
  content: string;
  tags: Tag[];
  isPrivate: boolean;
};

type Favorite = Note;

type FriendRequest = {
  id: String;
  status: String;
  from?: { id: string; username: string };
  to?: { id: string; username: string };
}

type Friend = {
  id: string;
  username: string;
}

export default function ProfileClient({ user, isOwnProfile, profileUserId, }: { user: any; isOwnProfile: boolean, profileUserId: string }) {

  const { userId: loggedInUserId } = useAuth();
  const [notes, setNotes] = useState<Note[]>(user.notes || []);
  const [favorites, setFavorites] = useState<Favorite[]>(Array.isArray(user?.favoriteNotes) ? user.favoriteNotes : []);
  const [friends, setFriends] = useState<Friend[]>(user.friends || []);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(favorites.map(fav => fav.id)))
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [showPrivate, setShowPrivate] = useState(false);
  const isFriend = !isOwnProfile && Array.isArray(friends) && friends.some((f: any) => f.id === loggedInUserId);
  const hasSentRequest = Array.isArray(sentRequests) && sentRequests.some((r: any) => r.to?.id === profileUserId);
  const hasReceivedRequest = Array.isArray(receivedRequests) && receivedRequests.some((r: any) => r.from?.id === profileUserId);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  let buttonLabel = "Add Friend";
  let disabled = false;

  if (isFriend) {
    buttonLabel = "This person is your friend";
    disabled = true;
  } else if (hasSentRequest) {
    buttonLabel = "Request Sent";
    disabled = true;
  } else if (hasReceivedRequest) {
    buttonLabel = "Accept / Reject Pending";
    disabled = true;
  }

  useEffect(() => {
    if (!profileUserId) return;
    console.log("Profile User ID:", profileUserId);

    async function fetchProfileNotes() {
      const res = await fetch(`/api/notes?userId=${profileUserId}`);
      console.log("Fetching notes for userId:", res);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
      console.log("Fetched profile notes:", notes);
    }

    fetchProfileNotes();
  }, [profileUserId]);

  async function fetchMyFavorites() {
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setFavoriteIds(new Set(data.map((fav: Favorite) => fav.id)));

      if (isOwnProfile) {
        setFavorites(data);
      }
    }
  }

  useEffect(() => {
    fetchMyFavorites();
  }, [isOwnProfile]);

  useEffect(() => {
    if (!profileUserId) return;

    async function fetchProfileFriends() {
      const res = await fetch(`/api/friends/list?userId=${profileUserId}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    }

    fetchProfileFriends();
    console.log("Fetched Friends:", friends);
  }, [profileUserId]);

  useEffect(() => {
    if (isOwnProfile) {
      fetch("/api/friend-requests/list")
        .then((res) => res.json())
        .then((data: { requests: FriendRequest[] }) => {
          console.log("Fetched Friend Requests:", data);
          setReceivedRequests(data.requests || []);
        });
    }
  }, [isOwnProfile]);

  async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
    try {
      console.log("Toggling favorite for note:", noteId, "Currently favorited:", currentlyFavorited);
      
      const res = await fetch("/api/favorites", {
        method: currentlyFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response:", errorText);
        
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${res.status}: ${errorText}` };
        }
        
        throw new Error(`Failed to update favorite: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
      await fetchMyFavorites();
      
    } catch (error) {
      console.error("Toggle favorite error:", error);
      alert(`Error updating favorite: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handleFriend() {
    try {
      const res = await fetch("/api/friend-requests/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: profileUserId }),
      });

      if (res.ok) {
        console.log("Friend request sent!");
        const newRequest = await res.json();
        setSentRequests((prev) => [...prev, { ...newRequest, to: { id: profileUserId, username: user.username } }]);
      } else {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: "Unknown error (non-JSON response)" };
        }
        console.error("Failed to send friend request", errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("An unexpected error occurred.");
    }
  }

  async function handleFriendRequestAccept(fromId: string, requestId: string) {
    const res = await fetch("/api/friend-requests/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId }),
    });

    if (res.ok) {
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      setFriends(prev => [...prev, { id: fromId, username: "Unknown" }])
    }
  }

  async function handleFriendRequestReject(fromId: string, requestId: string) {
    const res = await fetch("/api/friend-requests/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId }),
    });

    if (res.ok) {
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
    }
  }

  return (

    <main>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <Box sx={{ backgroundColor: "#8E7499", px: 2, pt: 2, height: "100%", boxSizing: "border-box" }}>
        <Box sx={{
          background: "linear-gradient(to bottom, #446E99 0%, #172533 69%)",
          p: 4,
          minHeight: "100vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}>
          <SignedIn>
            <div className="mt-4">
              {/* <UniversalSearch /> */}

              <Box
                sx={{
                  position: "relative",
                  height: 1000,
                  backgroundColor: "#A5D0D0",
                  mb: 4,
                  overflowY: "auto",
                  overflowX: "hidden",
                  border: '2px solid #ccc',
                }}
              >
                <div className="mt-4">

                  {isOwnProfile && (
                    <button
                      onClick={() => setShowPrivate(prev => !prev)}
                      className="mb-4 px-4 py-2 bg-purple-600 text-white rounded"
                    >
                      {showPrivate ? "Show Public Notes" : "Show Private Notes"}
                    </button>
                  )}

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Dreams" : `${user.username}'s Dreams`}</h2>

                    {(() => {
                      const visibleNotes = notes.filter(note => {
                        if (isOwnProfile) {
                          return showPrivate ? note.isPrivate : !note.isPrivate;
                        } else {
                          return !note.isPrivate;
                        }
                      });

                      if (visibleNotes.length === 0) {
                        return <p>No notes found.</p>;
                      }

                      return visibleNotes.map(note => {
                        return (
                          <DreamCard
                            key={note.id}
                            dream={note}
                            isFavorited={favoriteIds.has(note.id)}
                            onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                            onOpen={() => setSelectedNote(note)}
                          />
                        );
                      });
                    })()}
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Favorite Dreams" : `${user.username}'s Favorite Dreams`}</h2>

                    {Array.isArray(favorites) && favorites.length > 0 ? (
                      favorites.map(note => {
                        return (
                          <DreamCard
                            key={note.id}
                            dream={note}
                            isFavorited={favoriteIds.has(note.id)}
                            onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                            onOpen={() => setSelectedNote(note)}
                          />
                        );
                      })
                    ) : (
                      <p>No favorite dreams found.</p>
                    )}
                  </section>

                  {isOwnProfile && (
                    <div className="mb-4">
                      {receivedRequests.length > 0 && (
                        <h3 className="text-lg font-semibold">Received</h3>
                      )}
                      {Array.isArray(receivedRequests) && receivedRequests.length > 0 ? (
                        receivedRequests.map(({ id, from }) => {
                          return (
                            <FriendRequestCard
                              key={id as string}
                              from={from as { id: string; username: string }}
                              onAccept={() => handleFriendRequestAccept(from?.id as string, id as string)}
                              onReject={() => handleFriendRequestReject(from?.id as string, id as string)}
                            />
                          )
                        })
                      ) : null}
                    </div>
                  )}

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Friends" : `${user.username}'s Friends`}</h2>
                    {Array.isArray(friends) && friends.length > 0 ? (
                      friends.map(({ id, username }) => {
                        return (
                          <FriendCard
                            key={id as string}
                            username={username as string}
                          />
                        );
                      })
                    ) : (
                      <p>No friends found.</p>
                    )}
                  </section>

                  {!isOwnProfile && (
                    <button
                      onClick={() => handleFriend()}
                      disabled={disabled}
                      className={`mb-4 px-4 py-2 rounded text-white ${ disabled ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                    >
                      {buttonLabel}
                    </button>
                  )}

                  {selectedNote && (
                    <DreamModal
                      isOpen={true}
                      onClose={() => setSelectedNote(null)}
                      title={selectedNote.title}
                      content={selectedNote.content}
                      tags={selectedNote.tags.map(t => t.name)}
                      author={selectedNote.user?.username}
                    />
                  )}

                  <Link
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Home
                  </Link>
                </div>
              </Box>
            </div>
          </SignedIn>
        </Box>
      </Box>

      {isOwnProfile && (
        <>
          <button
            type="button"
            aria-label="Create Dream"
            onClick={() => setShowCreate(true)}
            className="fixed bottom-10 right-16 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-3xl font-semibold shadow-lg shadow-pink-900/40 transition-colors focus:outline-none focus:ring-4 focus:ring-pink-300"
          >
            +
          </button>

          {showCreate && (
            <CreateDreamModal
              isOpen={showCreate}
              onClose={() => setShowCreate(false)}
              onDreamCreated={note => setNotes(prev => [...prev, note])}
            />
          )}
        </>
      )}
    </main>
  );
}