"use client";

// Maybe add some arrows to go left and right through the array when in modal form
// Make page reload after accepting or rejecting a friend request

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Box, Grid, Button } from "@mui/material";
import DreamModal from "../../components/DreamModal";
import ProfileDreamCard from "../../components/ProfileDreamCard";
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
  const [dreamViewMode, setDreamViewMode] = useState<'public' | 'favorite' | 'private'>('public');
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

  const cycleDreamView = () => {
    setDreamViewMode(current => {
      switch (current) {
        case 'public':
          return 'favorite';
        case 'favorite':
          return isOwnProfile ? 'private' : 'public';
        case 'private':
          return 'public';
        default:
          return 'public';
      }
    });
  };

  const getDreamViewLabel = () => {
    switch (dreamViewMode) {
      case 'public':
        return 'Public Dreams';
      case 'favorite':
        return 'Favorite Dreams';
      case 'private':
        return 'Private Dreams';
      default:
        return 'Public Dreams';
    }
  };

  const getFilteredDreams = () => {
    switch (dreamViewMode) {
      case 'public':
        return notes.filter(note => !note.isPrivate);
      case 'favorite':
        return favorites;
      case 'private':
        return isOwnProfile ? notes.filter(note => note.isPrivate) : [];
      default:
        return notes.filter(note => !note.isPrivate);
    }
  };

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
            <Box>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 6, md: 8 }}>
                  Reverie
                </Grid>
                <Grid size={{ xs: 6, md: 4 }} sx={{ textAlign: "right" }}>
                  We are but stars, shivering in the dark
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button variant="contained" color="primary" href="/feed">
                        Feed
                      </Button>
                      <Button variant="contained" color="primary" onClick={cycleDreamView}>
                        {getDreamViewLabel()} ({getFilteredDreams().length})
                      </Button>
                      <Box sx={{ backgroundColor: "red" }}>
                        Search Bar
                      </Box>
                    </Box>
                  </Grid>
                  <Grid container size={{ xs: 12 }} spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ backgroundColor: "#FFFFFF", p: 2 }}>

                        <section className="mb-8">
                          <h2 className="text-2xl font-bold mb-4">
                            {dreamViewMode === 'public' && (isOwnProfile ? "Your Public Dreams" : `${user.username}'s Dreams`)}
                            {dreamViewMode === 'favorite' && (isOwnProfile ? "Your Favorite Dreams" : `${user.username}'s Favorite Dreams`)}
                            {dreamViewMode === 'private' && "Your Private Dreams"}
                          </h2>

                          {(() => {
                            const filteredDreams = getFilteredDreams();

                            if (filteredDreams.length === 0) {
                              return (
                                <p className="text-gray-500 italic">
                                  {dreamViewMode === 'public' && "No public dreams found."}
                                  {dreamViewMode === 'favorite' && "No favorite dreams found."}
                                  {dreamViewMode === 'private' && "No private dreams found."}
                                </p>
                              );
                            }

                            return filteredDreams.map(note => (
                              <ProfileDreamCard
                                key={note.id}
                                dream={note}
                                isFavorited={favoriteIds.has(note.id)}
                                onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                                onOpen={() => setSelectedNote(note)}
                              />
                            ));
                          })()}
                        </section>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ backgroundColor: "#FFFFFF", height: "100%"}}>
                        <Box>
                          Profile Image and Description
                        </Box>
                        <Box>
                          {isOwnProfile && (
                            <div className="mb-4">
                              {receivedRequests.length > 0 && (
                                <h3 className="text-lg font-semibold">Received Friend Requests</h3>
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

                          {!isOwnProfile && (
                            <button
                              onClick={() => handleFriend()}
                              disabled={disabled}
                              className={`mb-4 px-4 py-2 rounded text-white ${ disabled ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                            >
                              {buttonLabel}
                            </button>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, md: 12}}>
                  <Box sx={{ backgroundColor: "#FFFFFF"}}>
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Friends" : `${user.username}'s Friends`}</h2>
                      {Array.isArray(friends) && friends.length > 0 ? (
                        friends.map(({ id, username }) => {
                          return (
                            <FriendCard
                              key={id as string}
                              username={username as string}
                            />
                          )
                        })
                      ) : (
                        <p>No friends found.</p>
                      )}
                    </section>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box sx={{ textAlign: "right" }}>
                    Could it think, the heart would stop beating
                  </Box>
                </Grid>
              </Grid>

              <div>
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
              </div>

            </Box>
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