"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import FavoriteHeart from "../../components/HeartButton";
import ReactMarkdown from "react-markdown";

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
  const [privateNote, setPrivateNote] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const isFriend = !isOwnProfile && Array.isArray(friends) && friends.some((f: any) => f.id === loggedInUserId);
  const hasSentRequest = Array.isArray(sentRequests) && sentRequests.some((r: any) => r.to?.id === profileUserId);
  const hasReceivedRequest = Array.isArray(receivedRequests) && receivedRequests.some((r: any) => r.from?.id === profileUserId);

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

  async function handleAddNote() {
    const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags: tagsArray, private: privateNote }),
    });

    if (res.ok) {
      const newNote = await res.json();
      setNotes((prev) => [{ ...newNote, isPrivate: newNote.isPrivate ?? newNote.private ?? privateNote }, ...prev]);
      setTitle("");
      setContent("");
      setTags("");
      setPrivateNote(false);
    }
  }

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

          {isOwnProfile && (
            <div className="mb-6">
              <div className="bg-pink-900 p-4">
                <input
                  className="border rounded p-2 w-full mb-2"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <textarea
                className="border rounded p-2 w-full mb-2"
                placeholder="Content (Markdown supported)"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                className="border rounded p-2 w-full"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <div className="flex items-center mt-2">
                <input
                  id="private"
                  type="checkbox"
                  checked={privateNote}
                  onChange={(e) => setPrivateNote(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="private">Private Note</label>
              </div>
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleAddNote}
              >
                Add Note
              </button>
            </div>
          )}

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

              return visibleNotes.map(({ id, user, title, content, tags, isPrivate }) => (
                <article key={id} className="border-b py-4">
                  <div>
                    <h2 className="text-xl font-semibold">Posted by {user?.username || "Unknown"}</h2>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    <p className="text-sm text-gray-500 mt-2">
                      Tags: {tags ? tags.map(tag => tag.name).join(', ') : 'No Tags'}
                    </p>
                    <div>
                      {!isPrivate && (
                        <FavoriteHeart
                          isFavorited={favoriteIds.has(id)}
                          onToggle={() => toggleFavorite(id, favoriteIds.has(id))}
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))
            })()}
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Favorite Dreams" : `${user.username}'s Favorite Dreams`}</h2>

            {Array.isArray(favorites) && favorites.length > 0 ? (
              favorites.map(({ id, user, title, content, tags }) => (
                <article key={id} className="border-b py-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Posted by {user?.username || "Unknown"}</h2>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    <p className="text-sm text-gray-500 mt-2">
                      Tags: {tags ? tags.map(tag => tag.name).join(', ') : 'No Tags'}
                    </p>
                  </div>
                  <div className="ml-4">

                    {(isOwnProfile &&
                      <FavoriteHeart
                        isFavorited={favoriteIds.has(id)}
                        onToggle={() => toggleFavorite(id, favoriteIds.has(id))}
                      />
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p>No favorite notes found.</p>
            )}
          </section>
          
          {isOwnProfile && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Received</h3>
              {Array.isArray(receivedRequests) && receivedRequests.length > 0 ? (
                receivedRequests.map(({ id, from }) => (
                  <article key={id as string} className="border-b py-4">
                    <h2 className="text-xl font-semibold">From: {from?.username || "Unknown"}</h2>
                    <button onClick={() => handleFriendRequestAccept(from?.id as string, id as string)} className="mb-4 px-4 py-2 bg-purple-600 text-white rounded">
                      Accept Request
                    </button>
                    <button onClick={() => handleFriendRequestReject(from?.id as string, id as string)} className="mb-4 px-4 py-2 bg-purple-600 text-white rounded">
                      Reject Request
                    </button>
                  </article>
                ))
              ) : (
                <p>No friend requests received.</p>
              )}
            </div>
          )}

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Friends" : `${user.username}'s Friends`}</h2>
            {Array.isArray(friends) && friends.length > 0 ? (
              friends.map(({ id, username }) => (
                <article key={id} className="border-b py-4">
                  <h2 className="text-xl font-semibold">Friend: {username || "Unknown"}</h2>
                </article>
              ))
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
          
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Home
          </Link>
        </div>
      </SignedIn>
    </main>
  );
}