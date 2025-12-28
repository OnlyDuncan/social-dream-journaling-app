"use client";

// Maybe add some arrows to go left and right through the array when in modal form
// Make page reload after accepting or rejecting a friend request or make button label update
// When user sends request to other user and reloads page, it doesn't say Request Sent anymore
// User not added to database until they make a post or favorite something
// Favoriting dreams does not seem to be working anymore

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Grid, Button, Typography, Link, Select, FormControl, MenuItem } from "@mui/material";
import WarningModal from "../../components/WarningModal";
import DreamModal from "../../components/DreamModal";
import ProfileDreamCard from "../../components/ProfileDreamCard";
import FriendRequestCard from "../../components/FriendRequestCard";
import FriendCard from "../../components/FriendCard";
import CreateDreamModal from "../../components/CreateDreamModal";
import AvatarPlaceholder from "../../components/AvatarPlaceholder";

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
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  // const [limitType, setLimitType] = useState<'favorites' | 'public' | 'private' | null>(null);
  // const [warningType, setWarningType] = useState<'warning' | 'limit' | null>(null);

  let buttonLabel = "Add Friend";
  let disabled = false;

  // Changes button label to match friend status
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

  // Gets filtered dreams based off of selected view mode
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

  // Number of public dreams by profile user
  const getPublicDreamsCount = () => {
    return notes.filter(note => !note.isPrivate).length;
  };

  // Number of favorite dreams by profile user
  const getFavoriteDreamsCount = () => {
    return favoriteIds.size;
  };

  // Number of private dreams by profile user
  const getPrivateDreamsCount = () => {
    return notes.filter(note => note.isPrivate).length;
  };

  // If favoriteIds size reaches 50, show warning
  useEffect(() => {
    if (favoriteIds.size >= 1) {
      setShowLimitWarning(true);
    }
  }, [favoriteIds]);

  // useEffect(() => {
  //   if (notes.filter(note => !note.isPrivate).length >= 45 && notes.filter(note => !note.isPrivate).length < 50) {
  //     setShowLimitWarning(true);
  //     setLimitType('public');
  //     setWarningType('warning');
  //   }

  //   if (notes.filter(note => !note.isPrivate).length >= 50) {
  //     setShowLimitWarning(true);
  //     setLimitType('public');
  //     setWarningType('limit');
  //   }

  //   if (notes.filter(note => note.isPrivate).length >= 45 && notes.filter(note => note.isPrivate).length < 50) {
  //     setShowLimitWarning(true);
  //     setLimitType('private');
  //     setWarningType('warning');
  //   }

  //   if (notes.filter(note => note.isPrivate).length >= 50) {
  //     setShowLimitWarning(true);
  //     setLimitType('private');
  //     setWarningType('limit');
  //   }
  // }, [notes]);

  // Fetches dreams of the profile page user is on
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

  // Fetches favorite dreams / favorite dream ids
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

  // Fetches favorite dreams when on own profile
  useEffect(() => {
    fetchMyFavorites();
  }, [isOwnProfile]);

  // Fetches friends of the profile page user
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

  // Fetches friend requests if on users own profile
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

  // Function for toggling a dream as a favorite or not
  async function toggleFavorite(noteId: string, currentlyFavorited: boolean) {
    try {
      console.log("Toggling favorite for note:", noteId, "Currently favorited:", currentlyFavorited);
      
      if (!currentlyFavorited && favoriteIds.size >= 1) {
        // setShowLimitWarning(true);
        // setLimitType('favorites');
        // setWarningType('limit');
        return;
      }

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

  // Delete current note
  async function handleDelete(noteId: string ) {
    try {
      const res = await fetch(`/api/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId }),
      });

      if (res.ok) {
        console.log("Note deleted successfully");
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        setSelectedNote(null);
      } else {
        console.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  // Function for adding a friend / sending a request
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

  // Function for accepting a friend request
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

  // Function for rejecting a friend request
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
                  <Link href="/">
                    <img src="/images/Logo.svg" alt="Reverie Logo" style={{ height: 85, transform: "translateY(-10px)" }} />
                  </Link>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }} sx={{ textAlign: "right" }}>
                  <Typography className="text-white" sx={{ textWrap: "nowrap", display: { xs: "none", lg: "block" } }}>
                    We are but stars, shivering in the dark
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button variant="contained" color="primary" href="/feed">
                        Feed
                      </Button>
                      <FormControl size="small" sx={{
                        minWidth: { xs: "100%", sm: 120 },
                        width: { xs: "100%", sm: "auto" },
                        backgroundColor: "primary.main",
                        '& .MuiSelect-select': {
                          color: 'white',
                        },
                        '& .MuiSelect-icon': {
                          color: 'white',
                        },
                        // '& .MuiOutlinedInput-notchedOutline': {
                        //   borderColor: 'white',
                        // },
                        // '&:hover .MuiOutlinedInput-notchedOutline': {
                        //   borderColor: 'white',
                        // },
                        // '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        //   borderColor: 'white',
                        // },
                      }}>
                        <Select
                          value={dreamViewMode}
                        >
                          <MenuItem value="public" onClick={()=> setDreamViewMode("public")}>Public ({getPublicDreamsCount()})</MenuItem>
                          <MenuItem value="favorite" onClick={()=> setDreamViewMode("favorite")}>Favorite ({getFavoriteDreamsCount()})</MenuItem>
                          {isOwnProfile && (
                            <MenuItem value="private" onClick={()=> setDreamViewMode("private")}>Private ({getPrivateDreamsCount()})</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid container size={{ xs: 12 }} spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box 
                        sx={{ 
                          // backgroundColor: "#FFFFFF", 
                          p: 2
                        }}
                      >
                        <section className="mb-8">
                          <h2 className="text-2xl font-bold mb-4 text-white">
                            {dreamViewMode === 'public' && (isOwnProfile ? "My Public Dreams" : `${user.username}'s Dreams`)}
                            {dreamViewMode === 'favorite' && (isOwnProfile ? "My Favorite Dreams" : `${user.username}'s Favorite Dreams`)}
                            {dreamViewMode === 'private' && "My Private Dreams"}
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

                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  overflowY: "auto",
                                  gap: 2,
                                  pl: 2,
                                  maxHeight: 400,
                                  direction: 'rtl',
                                  '&::-webkit-scrollbar': {
                                    width: 8,
                                  },
                                  '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 4,
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 4,
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ direction: 'ltr' }}>
                                  {filteredDreams.map(note => (
                                    <ProfileDreamCard
                                      key={note.id}
                                      dream={note}
                                      isFavorited={favoriteIds.has(note.id)}
                                      onToggleFavorite={() => toggleFavorite(note.id, favoriteIds.has(note.id))}
                                      onOpen={() => setSelectedNote(note)}
                                      canFavorite={favoriteIds.size < 1}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            );
                          })()}
                        </section>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ backgroundColor: "#C9FFFF", height: "100%", borderRadius: 5, p: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography className="text-2xl font-bold mb-4" sx={{ mx: "auto" }}>{isOwnProfile ? "My Profile" : `${user.username}`}</Typography>
                          <AvatarPlaceholder size={96} className="mb-2 mx-auto" />
                          <Box sx={{ height: 60, mb: 2, backgroundColor: "#E0E0E0", borderRadius: 2 }} >
                            <p className="p-2 text-gray-700 italic">
                              Description Placeholder
                            </p>
                          </Box>
                        </Box>
                        <Box>
                          {isOwnProfile && (
                            <div className="mb-4">
                              {receivedRequests.length > 0 && (
                                <h3 className="text-lg font-semibold mb-4">Friend Requests</h3>
                              )}
                              {Array.isArray(receivedRequests) && receivedRequests.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    overflowY: "auto",
                                    gap: 2,
                                    pb: 2,
                                    maxHeight: 300,
                                    '&::-webkit-scrollbar': {
                                      width: 8,
                                    },
                                    '&::-webkit-scrollbar-track': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      borderRadius: 4,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                      borderRadius: 4,
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                      },
                                    },
                                  }}
                                >
                                  {receivedRequests.map(({ id, from }) => {
                                    return (
                                      <FriendRequestCard
                                        key={id as string}
                                        from={from as { id: string; username: string }}
                                        onAccept={() => handleFriendRequestAccept(from?.id as string, id as string)}
                                        onReject={() => handleFriendRequestReject(from?.id as string, id as string)}
                                      />
                                    )
                                  })}
                                </Box>
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
                  <Box 
                    sx={{ 
                      // backgroundColor: "#FFFFFF"
                    }}
                  >
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4 text-white">{isOwnProfile ? "My Friends" : `${user.username}'s Friends`}</h2>
                      
                      {Array.isArray(friends) && friends.length > 0 ? (
                        <Box
                          sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            gap: 2,
                            pb: 2,
                            '&::-webkit-scrollbar': {
                              height: 8,
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: 4,
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              borderRadius: 4,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                              },
                            },
                          }}
                        >
                          {friends.map(({ id, username }) => (
                            <FriendCard 
                              key={id as string} 
                              username={username as string} 
                            />
                          ))}
                        </Box>
                      ) : (
                        <p className="text-white">No friends found.</p>
                      )}
                    </section>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Typography className="text-white" sx={{ textAlign: "left", textWrap: "nowrap", display: { xs: "none", lg: "block" } }}>
                    Could it think, the heart would stop beating
                  </Typography>
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
                    isFavorited={favoriteIds.has(selectedNote.id)}
                    onToggleFavorite={() => toggleFavorite(selectedNote.id, favoriteIds.has(selectedNote.id))}
                    handleDelete={() => handleDelete(selectedNote.id)}
                    canFavorite={favoriteIds.size < 1}
                  />
                )}
              </div>

            </Box>
          </SignedIn>
        </Box>
      </Box>
      
      {/* If on own profile page, displays create dreams button / modal and warning modal */}
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

          <WarningModal
            isOpen={showLimitWarning}
            onClose={() => setShowLimitWarning(false)}
          />
        </>
      )}
    </main>
  );
}