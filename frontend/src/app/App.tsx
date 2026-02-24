/**
 * App shell and local router for the MedGemma training UI.
 *
 * Responsibilities:
 * - Manage auth state and user profile hydration from Firebase.
 * - Persist completed case evaluations to Firestore.
 * - Route between home/case/chat/evaluation/profile screens.
 */
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
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

type CaseRecord = {
  id: string;
  title: string;
  date: string;
  completedAt: Date | null;
  score: number;
  initialScore: number;
  proficiency: string;
  strengths: string[];
  areasForGrowth: string[];
  performanceBreakdown: Array<{ label: string; value: number }>;
  transcript: Array<{ role: "student" | "attending"; content: string; timestamp: string }>;
  turnsToMeetAllMetrics: number | null;
  specialty: string;
  durationMinutes: number;
  duration: string;
};

type CompletedCasePayload = {
  score: number;
  initialScore: number;
  proficiency: string;
  strengths: string[];
  areasForGrowth: string[];
  performanceBreakdown: Array<{ label: string; value: number }>;
  transcript: Array<{ role: "student" | "attending"; content: string; timestamp: string }>;
  turnsToMeetAllMetrics: number | null;
  durationMinutes: number;
};

const defaultStats = {
  level: "Beginner",
  overallProficiency: 0,
  casesCompleted: 0,
  totalHours: 0,
  currentStreak: 0,
};

function getIdentityFromAuth(user: User): { name: string; email: string; photoURL: string } {
  // Prefer Google provider profile values, with graceful fallbacks.
  const providerProfile = user.providerData.find((p) => p?.providerId === "google.com");
  const email = user.email ?? providerProfile?.email ?? "";
  const nameFromEmail = email.includes("@") ? email.split("@")[0] : "";

  return {
    name: (user.displayName ?? providerProfile?.displayName ?? nameFromEmail) || "Unknown User",
    email,
    photoURL: user.photoURL ?? providerProfile?.photoURL ?? "",
  };
}

function toUserProfile(user: User, data: DocumentData | undefined): UserProfile {
  // Merge identity from auth with persisted profile statistics.
  const identity = getIdentityFromAuth(user);

  return {
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

function profileLevelFromScore(score: number): string {
  // Shared proficiency bucketing used for profile display and case history.
  if (score >= 85) return "Advanced";
  if (score >= 70) return "Proficient";
  return "Beginner";
}

function toLocalDateKey(date: Date): string {
  // Stable yyyy-mm-dd key to compute streaks by local calendar day.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeCurrentStreak(cases: CaseRecord[]): number {
  // Count contiguous completion days ending today (or yesterday if no case today).
  const dayKeys = new Set(
    cases
      .map((item) => item.completedAt)
      .filter((date): date is Date => Boolean(date))
      .map((date) => toLocalDateKey(date)),
  );
  if (!dayKeys.size) return 0;

  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday);

  if (!dayKeys.has(todayKey) && !dayKeys.has(yesterdayKey)) {
    return 0;
  }

  let cursor = new Date(today);
  if (!dayKeys.has(todayKey)) {
    cursor = yesterday;
  }

  let streak = 0;
  while (dayKeys.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function App() {
  // Screen state acts as a lightweight local router.
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [presentation, setPresentation] = useState<string>("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [recentCases, setRecentCases] = useState<CaseRecord[]>([]);
  const [latestEvaluation, setLatestEvaluation] = useState<CompletedCasePayload | null>(null);
  const [evaluationBackScreen, setEvaluationBackScreen] = useState<"chat" | "profile">("chat");

  useEffect(() => {
    // Keep app auth/profile state synchronized with Firebase Auth + Firestore.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);

      if (!user) {
        setProfile(null);
        setRecentCases([]);
        return;
      }

      setProfile(toUserProfile(user, undefined));

      void (async () => {
        try {
          const identity = getIdentityFromAuth(user);
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
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
          console.error("Failed to read/write Firestore profile:", error);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Stream recent case history for the authenticated user.
    if (!authUser) return;

    const casesQuery = query(
      collection(db, "users", authUser.uid, "cases"),
      orderBy("completedAt", "desc"),
      limit(100),
    );

    const unsubscribe = onSnapshot(casesQuery, (snapshot) => {
      const items = snapshot.docs.map((item) => {
        const data = item.data({ serverTimestamps: "estimate" });
        const completedAt = data.completedAt?.toDate ? data.completedAt.toDate() : null;
        return {
          id: item.id,
          title: data.title ?? "Clinical Case",
          date: completedAt ? completedAt.toLocaleDateString() : "Unknown",
          completedAt,
          score: data.score ?? 0,
          initialScore: data.initialScore ?? data.score ?? 0,
          proficiency: data.proficiency ?? profileLevelFromScore(data.score ?? 0),
          strengths: Array.isArray(data.strengths) ? data.strengths : [],
          areasForGrowth: Array.isArray(data.areasForGrowth) ? data.areasForGrowth : [],
          performanceBreakdown: Array.isArray(data.performanceBreakdown) ? data.performanceBreakdown : [],
          transcript: Array.isArray(data.transcript) ? data.transcript : [],
          turnsToMeetAllMetrics: data.turnsToMeetAllMetrics ?? null,
          specialty: data.specialty ?? "General",
          durationMinutes: Math.max(1, data.durationMinutes ?? 0),
          duration: `${Math.max(1, data.durationMinutes ?? 0)} min`,
        } satisfies CaseRecord;
      });
      setRecentCases(items);
    });

    return () => unsubscribe();
  }, [authUser]);

  const specialtyStats = useMemo(() => {
    // Derive per-specialty counts and average scores for profile analytics.
    const bySpecialty = new Map<string, { cases: number; totalScore: number }>();
    for (const item of recentCases) {
      const current = bySpecialty.get(item.specialty) ?? { cases: 0, totalScore: 0 };
      current.cases += 1;
      current.totalScore += item.score;
      bySpecialty.set(item.specialty, current);
    }

    return Array.from(bySpecialty.entries()).map(([name, value]) => ({
      name,
      cases: value.cases,
      avgScore: Math.round(value.totalScore / value.cases),
    }));
  }, [recentCases]);

  const derivedTrainingStats = useMemo(() => {
    // Compute dashboard stats from case history to avoid duplicating logic.
    const casesCompleted = recentCases.length;
    const totalMinutes = recentCases.reduce((sum, item) => sum + item.durationMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const overallProficiency = casesCompleted
      ? Math.round(recentCases.reduce((sum, item) => sum + item.score, 0) / casesCompleted)
      : 0;
    const currentStreak = computeCurrentStreak(recentCases);
    const level = profileLevelFromScore(overallProficiency);
    return { casesCompleted, totalHours, overallProficiency, currentStreak, level };
  }, [recentCases]);

  useEffect(() => {
    // Reflect derived stats in local profile state and persist them to Firestore.
    if (!authUser) return;

    setProfile((prev) => {
      const identity = getIdentityFromAuth(authUser);
      const baseProfile = prev ?? {
        name: identity.name || "Unknown User",
        email: identity.email || "",
        photoURL: identity.photoURL || "",
        ...defaultStats,
      };
      const nextProfile = {
        ...baseProfile,
        ...derivedTrainingStats,
      };
      if (
        prev &&
        prev.casesCompleted === nextProfile.casesCompleted &&
        prev.totalHours === nextProfile.totalHours &&
        prev.overallProficiency === nextProfile.overallProficiency &&
        prev.currentStreak === nextProfile.currentStreak &&
        prev.level === nextProfile.level
      ) {
        return prev;
      }
      return nextProfile;
    });

    void setDoc(
      doc(db, "users", authUser.uid),
      {
        ...derivedTrainingStats,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }, [authUser, derivedTrainingStats]);

  const handleStartTraining = async () => {
    if (!authUser) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Google sign-in failed:", error);
        alert("Sign-in failed. Please try again.");
        return;
      }
    }
    setCurrentScreen("case");
  };

  const handleSignIn = async () => {
    if (authUser) {
      setCurrentScreen("profile");
      return;
    }

    try {
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

  const handleCompleteCase = (payload: CompletedCasePayload) => {
    // Cache latest evaluation for immediate UI navigation and persist server-side.
    setLatestEvaluation(payload);
    setEvaluationBackScreen("chat");
    setCurrentScreen("evaluation");

    if (!authUser) return;

    const specialty = "Pulmonology";
    const caseTitle = "Progressive Dyspnea Case";

    void addDoc(collection(db, "users", authUser.uid, "cases"), {
      title: caseTitle,
      specialty,
      score: payload.score,
      initialScore: payload.initialScore,
      proficiency: payload.proficiency,
      strengths: payload.strengths,
      areasForGrowth: payload.areasForGrowth,
      performanceBreakdown: payload.performanceBreakdown,
      transcript: payload.transcript,
      turnsToMeetAllMetrics: payload.turnsToMeetAllMetrics,
      durationMinutes: payload.durationMinutes,
      presentation,
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }).catch((error) => console.error("Failed to save completed case:", error));
  };

  const handleViewCaseFromProfile = (caseId: string) => {
    const selectedCase = recentCases.find((item) => item.id === caseId);
    if (!selectedCase) return;

    setLatestEvaluation({
      score: selectedCase.score,
      initialScore: selectedCase.initialScore,
      proficiency: selectedCase.proficiency,
      strengths: selectedCase.strengths,
      areasForGrowth: selectedCase.areasForGrowth,
      performanceBreakdown: selectedCase.performanceBreakdown,
      transcript: selectedCase.transcript,
      turnsToMeetAllMetrics: selectedCase.turnsToMeetAllMetrics,
      durationMinutes: selectedCase.durationMinutes,
    });
    setEvaluationBackScreen("profile");
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
          onBack={() => setCurrentScreen(evaluationBackScreen)}
          onStartNewCase={handleStartNewCase}
          onViewProfile={handleViewProfile}
          evaluation={latestEvaluation ? {
            initialScore: latestEvaluation.initialScore,
            finalScore: latestEvaluation.score,
            proficiency: latestEvaluation.proficiency,
            strengths: latestEvaluation.strengths,
            areasForGrowth: latestEvaluation.areasForGrowth,
            performanceBreakdown: latestEvaluation.performanceBreakdown,
            transcript: latestEvaluation.transcript,
          } : null}
        />
      )}

      {currentScreen === "profile" && (
        <ProfilePage
          onBack={handleBackToHome}
          onStartNewCase={handleStartNewCase}
          onViewCase={handleViewCaseFromProfile}
          onSignOut={handleSignOut}
          profile={profile}
          recentCases={recentCases}
          specialtyStats={specialtyStats}
        />
      )}
    </div>
  );
}
