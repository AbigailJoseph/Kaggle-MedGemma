import { Button } from "./ui/button";
import { Stethoscope, Brain, MessageSquare, TrendingUp } from "lucide-react";

interface HomePageProps {
  onStartTraining: () => void;
  onSignIn: () => void;
}

export function HomePage({ onStartTraining, onSignIn }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#071C5A] bg-[#071C5A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">AI Attending</span>
          </div>
          <Button variant="outline" onClick={onSignIn} className="border-white text-white hover:bg-white/10 hover:text-white">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-semibold text-foreground mb-6">
            Practice Clinical Reasoning with Your AI Attending
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Sharpen your diagnostic skills through realistic case simulations. Present cases, 
            defend your diagnoses, and receive expert feedback in a safe, structured learning environment.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={onStartTraining}
              className="bg-[#071C5A] hover:bg-[#0d2d8a] text-white px-8 py-6 text-lg shadow-lg"
            >
              Start Training
            </Button>
            <Button 
              variant="outline" 
              onClick={onSignIn}
              className="px-8 py-6 text-lg border-2 border-[#071C5A] text-[#071C5A] hover:bg-[#071C5A]/5"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="w-12 h-12 bg-[--navy]/10 rounded-lg flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-[--navy]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Review the Case</h3>
            <p className="text-muted-foreground text-sm">
              Examine patient vitals, symptoms, labs, and history in a structured format.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="w-12 h-12 bg-[--teal]/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-[--teal]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Present Your Diagnosis</h3>
            <p className="text-muted-foreground text-sm">
              Submit your structured presentation, differential, and management plan.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="w-12 h-12 bg-[--navy]/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-[--navy]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Receive Feedback</h3>
            <p className="text-muted-foreground text-sm">
              Engage with Socratic questions and expert guidance to deepen your reasoning.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="w-12 h-12 bg-[--teal]/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[--teal]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">4. Track Progress</h3>
            <p className="text-muted-foreground text-sm">
              Get detailed evaluations and monitor your clinical reasoning improvement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
