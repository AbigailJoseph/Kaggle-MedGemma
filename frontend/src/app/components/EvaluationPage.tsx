import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ArrowLeft, TrendingUp, Award, CheckCircle2, AlertCircle, Activity, MessageSquare } from "lucide-react";

interface EvaluationPageProps {
  onBack: () => void;
  onStartNewCase: () => void;
  onViewProfile: () => void;
}

export function EvaluationPage({ onBack, onStartNewCase, onViewProfile }: EvaluationPageProps) {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#071C5A] bg-[#071C5A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2 text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <h2 className="text-lg font-semibold text-white">Case Evaluation</h2>
          </div>
          <Button onClick={onStartNewCase} className="bg-white text-[#071C5A] hover:bg-white/90 shadow-lg">
            Start New Case
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Summary */}
        <Card className="p-8 mb-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl border-l-4 border-l-[#071C5A]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Excellent Progress!</h2>
              <p className="text-slate-700">Case #2847 - Chest Pain Evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Initial Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">{evaluation.initialScore}</span>
                <span className="text-slate-700">/ 100</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Final Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-teal-600">{evaluation.finalScore}</span>
                <span className="text-slate-700">/ 100</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Improvement</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-4xl font-bold text-green-600">+{evaluation.finalScore - evaluation.initialScore}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Proficiency Level:</span>
            <Badge className="bg-[#071C5A] text-white px-4 py-1">{evaluation.proficiency}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas for Growth */}
          <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Areas for Growth</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.areasForGrowth.map((area, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{area}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className="p-6 mb-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Performance Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Working Diagnosis</span>
                <span className="text-sm text-slate-700">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Differential Reasoning</span>
                <span className="text-sm text-slate-700">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Diagnostic Workup</span>
                <span className="text-sm text-slate-700">82%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Management Planning</span>
                <span className="text-sm text-slate-700">80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Clinical Communication</span>
                <span className="text-sm text-slate-700">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Full Transcript */}
        <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Full Conversation Transcript</h3>
          </div>
          <div className="space-y-4">
            {transcript.map((message, index) => (
              <div key={index} className="border-l-2 border-blue-300 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    {message.role === "student" ? "You" : "AI Attending"}
                  </span>
                  <span className="text-xs text-slate-600">{message.timestamp}</span>
                </div>
                <p className="text-sm text-slate-700">{message.content}</p>
              </div>
            ))}
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              View Full Transcript
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={onStartNewCase} className="bg-[#071C5A] hover:bg-[#0d2d8a] text-white px-8 shadow-lg">
            Start New Case
          </Button>
          <Button variant="outline" onClick={onViewProfile} className="px-8 border-2 border-[#071C5A] text-[#071C5A] hover:bg-[#071C5A]/5">
            View Profile
          </Button>
        </div>
      </main>
    </div>
  );
}
