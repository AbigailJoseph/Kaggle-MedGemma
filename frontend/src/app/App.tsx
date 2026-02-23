import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, type DocumentData,} from "firebase/firestore";
import { HomePage } from "./components/HomePage";
import { CaseScreen } from "./components/CaseScreen";
import { ChatScreen } from "./components/ChatScreen";
import { EvaluationPage } from "./components/EvaluationPage";
import { ProfilePage } from "./components/ProfilePage";
import { auth, db, googleProvider } from "../lib/firebase";

type Screen = "home" | "case" | "chat" | "evaluation" | "profile";

type UserProfile = {
  name: string;
  email: string;
  photoURL: string;
  level: string;
  overallProficiency: number;
  casesCompleted: number;
  totalHours: number;
  currentStreak: number;
};

// Default profile stats for first-time users
const defaultStats = {
  level: "Beginner",
  overallProficiency: 0,
  casesCompleted: 0,
  totalHours: 0,
  currentStreak: 0,
};

function getIdentityFromAuth(user: User): { name: string; email: string; photoURL: string } {
  const providerProfile = user.providerData.find((p) => p?.providerId === "google.com");
  const email = user.email ?? providerProfile?.email ?? "";
  const nameFromEmail = email.includes("@") ? email.split("@")[0] : "";

  return {
    name: (user.displayName ?? providerProfile?.displayName ?? nameFromEmail) || "Unknown User",
    email,
    photoURL: user.photoURL ?? providerProfile?.photoURL ?? "",
  };
}

// Normalizes a Firestore user document + Firebase auth user into one UI shape
function toUserProfile(user: User, data: DocumentData | undefined): UserProfile {
  const identity = getIdentityFromAuth(user);

  return {
    // Prefer live Google auth identity for display fields.
    name: identity.name || data?.name || "Unknown User",
    email: identity.email || data?.email || "",
    photoURL: identity.photoURL || data?.photoURL || "",
    level: data?.level ?? defaultStats.level,
    overallProficiency: data?.overallProficiency ?? defaultStats.overallProficiency,
    casesCompleted: data?.casesCompleted ?? defaultStats.casesCompleted,
    totalHours: data?.totalHours ?? defaultStats.totalHours,
    currentStreak: data?.currentStreak ?? defaultStats.currentStreak,
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [presentation, setPresentation] = useState<string>("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Sync app state with Firebase auth session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);

      if (!user) {
        // Signed out state: clear profile.
        setProfile(null);
        return;
      }

      // Render immediately from auth identity, then sync richer profile data from Firestore.
      setProfile(toUserProfile(user, undefined));

      void (async () => {
        try {
          const identity = getIdentityFromAuth(user);

          // Each user has one profile document in /users/{uid}
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // First sign-in: create a starter profile in Firestore
            const newProfile = {
              name: identity.name,
              email: identity.email,
              photoURL: identity.photoURL,
              ...defaultStats,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile);
            setProfile(toUserProfile(user, newProfile));
          } else {
            // Returning user
            const existing = userSnap.data();
            await setDoc(
              userRef,
              {
                name: identity.name || existing.name || "Unknown User",
                email: identity.email || existing.email || "",
                photoURL: identity.photoURL || existing.photoURL || "",
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
            setProfile(toUserProfile(user, existing));
          }
        } catch (error) {
          // If Firestore is blocked/misconfigured, keep auth-based profile.
          console.error("Failed to read/write Firestore profile:", error);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  const handleStartTraining = () => {
    setCurrentScreen("case");
  };

  const handleSignIn = async () => {
    if (authUser) {
      // Reuse sign-in button as "go to profile" when already authenticated
      setCurrentScreen("profile");
      return;
    }

    try {
      // Starts Google OAuth popup flow
      await signInWithPopup(auth, googleProvider);
      setCurrentScreen("profile");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  const handleSubmitCase = (presentationText: string) => {
    setPresentation(presentationText);
    setCurrentScreen("chat");
  };

  const handleCompleteCase = () => {
    setCurrentScreen("evaluation");
  };

  const handleStartNewCase = () => {
    setPresentation("");
    setCurrentScreen("case");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
  };

  const handleViewProfile = () => {
    setCurrentScreen("profile");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentScreen("home");
    } catch (error) {
      console.error("Sign-out failed:", error);
      alert("Sign-out failed. Please try again.");
    }
  };

  if (!isAuthReady) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="size-full">
      {currentScreen === "home" && (
        <HomePage
          onStartTraining={handleStartTraining}
          onSignIn={authUser ? handleViewProfile : handleSignIn}
          isSignedIn={Boolean(authUser)}
          profileName={profile?.name}
          profilePhotoURL={profile?.photoURL}
        />
      )}

      {currentScreen === "case" && (
        <CaseScreen
          onBack={handleBackToHome}
          onSubmit={handleSubmitCase}
        />
      )}

      {currentScreen === "chat" && (
        <ChatScreen
          initialPresentation={presentation}
          onBack={() => setCurrentScreen("case")}
          onComplete={handleCompleteCase}
        />
      )}

      {currentScreen === "evaluation" && (
        <EvaluationPage
          onBack={() => setCurrentScreen("chat")}
          onStartNewCase={handleStartNewCase}
        />
      )}

      {currentScreen === "profile" && (
        <ProfilePage
          onBack={handleBackToHome}
          onStartNewCase={handleStartNewCase}
          onSignOut={handleSignOut}
          profile={profile}
        />
      )}
    </div>
  );
}
