import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ArrowLeft, TrendingUp, Award, CheckCircle2, AlertCircle } from "lucide-react";

interface EvaluationPageProps {
  onBack: () => void;
  onStartNewCase: () => void;
}

export function EvaluationPage({ onBack, onStartNewCase }: EvaluationPageProps) {
  const evaluation = {
    initialScore: 62,
    finalScore: 82,
    proficiency: "Proficient",
    strengths: [
      "Excellent identification of key clinical findings (elevated troponin, chest pain characteristics)",
      "Strong differential diagnosis construction with clear reasoning",
      "Appropriate prioritization of life-threatening conditions"
    ],
    areasForGrowth: [
      "Consider integrating social history and risk factors earlier in presentation",
      "Expand discussion of alternative diagnoses with specific evidence against them",
      "Elaborate on medication contraindications and patient-specific considerations"
    ]
  };

  const transcript = [
    {
      role: "student",
      content: "This is a 62-year-old male presenting with acute onset substernal chest pressure...",
      timestamp: "10:23 AM"
    },
    {
      role: "attending",
      content: "Thank you for that presentation. I can see you've identified some key findings...",
      timestamp: "10:24 AM"
    },
    {
      role: "student",
      content: "The elevated troponin indicates myocardial injury...",
      timestamp: "10:26 AM"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold">Case Evaluation</h2>
          </div>
          <Button onClick={onStartNewCase} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            Start New Case
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Summary */}
        <Card className="p-8 mb-6 border-l-4 border-l-[--teal]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[--teal]/10 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-[--teal]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Excellent Progress!</h2>
              <p className="text-muted-foreground">Case #2847 - Chest Pain Evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-background p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Initial Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground">{evaluation.initialScore}</span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Final Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-[--teal]">{evaluation.finalScore}</span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Improvement</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-4xl font-semibold text-green-600">+{evaluation.finalScore - evaluation.initialScore}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Proficiency Level:</span>
            <Badge className="bg-[--navy] text-white px-4 py-1">{evaluation.proficiency}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas for Growth */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Areas for Growth</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.areasForGrowth.map((area, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Performance Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Working Diagnosis</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Differential Reasoning</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Diagnostic Workup</span>
                <span className="text-sm text-muted-foreground">82%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Management Planning</span>
                <span className="text-sm text-muted-foreground">80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Clinical Communication</span>
                <span className="text-sm text-muted-foreground">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Full Transcript */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Full Conversation Transcript</h3>
          <div className="space-y-4">
            {transcript.map((message, index) => (
              <div key={index} className="border-l-2 border-border pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">
                    {message.role === "student" ? "You" : "AI Attending"}
                  </span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{message.content}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Full Transcript
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={onStartNewCase} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg">
            Start New Case
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "#/profile"} className="px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
            View Profile
          </Button>
        </div>
      </main>
    </div>
  );
}
