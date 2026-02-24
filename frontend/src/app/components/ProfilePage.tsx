import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Award, Trophy, TrendingUp, Calendar, CheckCircle2, Flame, Clock, BookOpen, Star, Target, Zap } from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
  onStartNewCase: () => void;
  onViewCase: (caseId: string) => void;
  onSignOut: () => void;
  profile: {
    name: string;
    email: string;
    photoURL: string;
    level: string;
    overallProficiency: number;
    casesCompleted: number;
    totalHours: number;
    currentStreak: number;
  } | null;
  recentCases: Array<{
    id: string;
    title: string;
    date: string;
    score: number;
    specialty: string;
    duration: string;
  }>;
  specialtyStats: Array<{
    name: string;
    cases: number;
    avgScore: number;
  }>;
}

export function ProfilePage({ onBack, onStartNewCase, onViewCase, onSignOut, profile, recentCases }: ProfilePageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const hasPerfectCase = recentCases.some((case_) => case_.score >= 100);
  const CASES_PER_PAGE = 5;

  const totalHistoryPages = Math.max(1, Math.ceil(recentCases.length / CASES_PER_PAGE));
  const pagedHistory = useMemo(() => {
    const start = (historyPage - 1) * CASES_PER_PAGE;
    return recentCases.slice(start, start + CASES_PER_PAGE);
  }, [historyPage, recentCases]);

  useEffect(() => {
    setHistoryPage((prev) => Math.min(prev, totalHistoryPages));
  }, [totalHistoryPages]);

  const profileData = profile ?? {
    name: "Unknown User",
    email: "",
    photoURL: "",
    level: "Beginner",
    overallProficiency: 0,
    casesCompleted: 0,
    totalHours: 0,
    currentStreak: 0,
  };

  const hasPhoto = Boolean(profileData.photoURL) && !imageFailed;
  const initials = profileData.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const badges = [
    { id: 1, name: "First Case", icon: Trophy, color: "text-yellow-600", bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100", borderColor: "border-yellow-300", ringColor: "ring-yellow-200", earned: profileData.casesCompleted >= 1 },
    { id: 2, name: "5 Cases", icon: Award, color: "text-blue-600", bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100", borderColor: "border-blue-300", ringColor: "ring-blue-200", earned: profileData.casesCompleted >= 5 },
    { id: 3, name: "10 Cases", icon: Star, color: "text-purple-600", bgColor: "bg-gradient-to-br from-purple-50 to-violet-100", borderColor: "border-purple-300", ringColor: "ring-purple-200", earned: profileData.casesCompleted >= 10 },
    { id: 4, name: "Week Streak", icon: Flame, color: "text-orange-600", bgColor: "bg-gradient-to-br from-orange-50 to-red-100", borderColor: "border-orange-300", ringColor: "ring-orange-200", earned: profileData.currentStreak >= 7 },
    { id: 5, name: "14-Day Streak", icon: Zap, color: "text-emerald-600", bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100", borderColor: "border-emerald-300", ringColor: "ring-emerald-200", earned: profileData.currentStreak >= 14 },
    { id: 6, name: "Perfect Score", icon: Trophy, color: "text-rose-600", bgColor: "bg-gradient-to-br from-rose-50 to-pink-100", borderColor: "border-rose-300", ringColor: "ring-rose-200", earned: hasPerfectCase },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-[#071C5A] bg-[#071C5A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2 text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <h2 className="text-lg font-semibold text-white">Your Profile</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onStartNewCase} className="bg-white text-[#071C5A] hover:bg-white/90 shadow-lg">
              Start New Case
            </Button>
            <Button variant="outline" onClick={onSignOut} className="border-white text-white hover:bg-white/10 hover:text-white">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-[#071C5A] via-[#0d2d8a] to-[#1a3fa8] px-6 pt-10 pb-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {hasPhoto ? (
              <img
                src={profileData.photoURL}
                alt={`${profileData.name} profile`}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white/20">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{profileData.name}</h1>
              <div className="flex items-center gap-3">
                <Badge className="bg-teal-400/20 text-teal-200 border border-teal-400/40 text-sm px-3 py-1">
                  {profileData.level}
                </Badge>
                {profileData.email && (
                  <span className="text-white/60 text-sm">{profileData.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-white/60 text-sm mb-1">Overall Proficiency</p>
            <p className="text-6xl font-bold text-white">{profileData.overallProficiency}<span className="text-3xl text-white/60">%</span></p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-10 pb-12">
        {/* Stat cards floating over the banner */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6 shadow-lg border border-blue-200 bg-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{profileData.casesCompleted}</p>
                <p className="text-sm text-slate-700">Cases Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-lg border border-blue-200 bg-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{profileData.totalHours}</p>
                <p className="text-sm text-slate-700">Training Hours</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-lg border border-blue-200 bg-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{profileData.currentStreak}</p>
                <p className="text-sm text-slate-700">Day Streak</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Badges */}
        <Card className="p-6 mb-6 shadow-sm border border-blue-200 bg-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">Badges & Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border text-center transition-transform hover:scale-105 ${
                  badge.earned
                    ? `${badge.bgColor} ${badge.borderColor} ring-2 ${badge.ringColor} shadow-sm`
                    : "bg-slate-50 border-slate-200 opacity-40 grayscale"
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-white/60 shadow-sm">
                  <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-slate-600"}`} />
                </div>
                <p className={`text-xs font-bold ${badge.earned ? badge.color : "text-slate-600"}`}>{badge.name}</p>
                {badge.earned && <CheckCircle2 className={`w-3 h-3 mx-auto mt-1 ${badge.color}`} />}
              </div>
            ))}
          </div>
        </Card>

        {/* Training History */}
        <Card className="p-6 mb-6 shadow-sm border border-blue-200 bg-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">Training History</h3>
          </div>
          {recentCases.length > 0 ? (
            <div className="space-y-3">
              {pagedHistory.map((case_) => (
                <div
                  key={case_.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => onViewCase(case_.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-slate-900">{case_.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {case_.date}
                        </span>
                        <span>·</span>
                        <span>{case_.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#071C5A]">{case_.score}</div>
                      <div className="text-xs text-slate-600">Score</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                    {case_.specialty}
                  </Badge>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-600">
                  Page {historyPage} of {totalHistoryPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    disabled={historyPage >= totalHistoryPages}
                    onClick={() => setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No completed cases yet.</p>
              <p className="text-xs text-slate-600 mt-1">Start a case to see your training history here.</p>
            </div>
          )}
        </Card>

        {/* Next Goals */}
        <Card className="p-6 shadow-sm border border-blue-200 bg-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">Next Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-blue-900">Reach Advanced Level</p>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-blue-900">{profileData.overallProficiency}%</span>
                <span className="text-sm text-blue-400">/ 85%</span>
              </div>
              <Progress value={Math.min(100, (profileData.overallProficiency / 85) * 100)} className="h-2.5 bg-blue-200" />
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-purple-900">Complete 30 Cases</p>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-purple-900">{profileData.casesCompleted}</span>
                <span className="text-sm text-purple-400">/ 30</span>
              </div>
              <Progress value={Math.min(100, (profileData.casesCompleted / 30) * 100)} className="h-2.5 bg-purple-200" />
            </div>
            <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-orange-900">14-Day Streak</p>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-orange-900">{profileData.currentStreak}</span>
                <span className="text-sm text-orange-400">/ 14</span>
              </div>
              <Progress value={Math.min(100, (profileData.currentStreak / 14) * 100)} className="h-2.5 bg-orange-200" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
