import { useState } from "react";
import { HomePage } from "./components/HomePage";
import { CaseScreen } from "./components/CaseScreen";
import { ChatScreen } from "./components/ChatScreen";
import { EvaluationPage } from "./components/EvaluationPage";
import { ProfilePage } from "./components/ProfilePage";

type Screen = "home" | "case" | "chat" | "evaluation" | "profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [presentation, setPresentation] = useState<string>("");

  const handleStartTraining = () => {
    setCurrentScreen("case");
  };

  const handleSignIn = () => {
    // Mock sign in - in real app would show auth modal
    alert("Sign in functionality would open here");
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

  return (
    <div className="size-full">
      {currentScreen === "home" && (
        <HomePage
          onStartTraining={handleStartTraining}
          onSignIn={handleSignIn}
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
        />
      )}
    </div>
  );
}
