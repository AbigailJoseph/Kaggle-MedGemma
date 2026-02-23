import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ArrowLeft, TrendingUp, Award, CheckCircle2, AlertCircle, Activity, MessageSquare } from "lucide-react";

interface EvaluationPageProps {
  onBack: () => void;
  onStartNewCase: () => void;
  onViewProfile: () => void;
  evaluation: {
    initialScore: number;
    finalScore: number;
    proficiency: string;
    strengths: string[];
    areasForGrowth: string[];
    performanceBreakdown: Array<{ label: string; value: number }>;
    transcript: Array<{ role: "student" | "attending"; content: string; timestamp: string }>;
  } | null;
}

export function EvaluationPage({ onBack, onStartNewCase, onViewProfile, evaluation }: EvaluationPageProps) {
  const data = evaluation ?? {
    initialScore: 0,
    finalScore: 0,
    proficiency: "Beginner",
    strengths: [],
    areasForGrowth: [],
    performanceBreakdown: [],
    transcript: [],
  };

  return (
    <div className="min-h-screen bg-white">
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
        <Card className="p-8 mb-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl border-l-4 border-l-[#071C5A]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Case Complete</h2>
              <p className="text-slate-700">Your performance summary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Initial Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">{data.initialScore}</span>
                <span className="text-slate-700">/ 100</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Final Assessment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-teal-600">{data.finalScore}</span>
                <span className="text-slate-700">/ 100</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 mb-2">Improvement</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-4xl font-bold text-green-600">+{Math.max(0, data.finalScore - data.initialScore)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Proficiency Level:</span>
            <Badge className="bg-[#071C5A] text-white px-4 py-1">{data.proficiency}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Strengths</h3>
            </div>
            {data.strengths.length > 0 ? (
              <ul className="space-y-3">
                {data.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700">No strengths were captured for this case yet.</p>
            )}
          </Card>

          <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Areas for Growth</h3>
            </div>
            {data.areasForGrowth.length > 0 ? (
              <ul className="space-y-3">
                {data.areasForGrowth.map((area, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700">No specific growth areas captured for this case.</p>
            )}
          </Card>
        </div>

        <Card className="p-6 mb-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Performance Breakdown</h3>
          </div>
          {data.performanceBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.performanceBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    <span className="text-sm text-slate-700">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-700">No detailed metric breakdown available for this case.</p>
          )}
        </Card>

        <Card className="p-6 border border-blue-200 bg-blue-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Conversation Transcript</h3>
          </div>
          {data.transcript.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {data.transcript.map((message, index) => (
                <div key={index} className="border-l-2 border-blue-300 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">
                      {message.role === "student" ? "You" : "AI Attending"}
                    </span>
                    <span className="text-xs text-slate-600">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-700">No transcript available.</p>
          )}
        </Card>

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