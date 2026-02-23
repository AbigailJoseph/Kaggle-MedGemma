import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Award, Trophy, Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
  onStartNewCase: () => void;
}

export function ProfilePage({ onBack, onStartNewCase }: ProfilePageProps) {
  const profile = {
    name: "Dr. Sarah Chen",
    level: "Intermediate",
    overallProficiency: 78,
    casesCompleted: 24,
    totalHours: 18.5,
    currentStreak: 7
  };

  const badges = [
    { id: 1, name: "First Case", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50", earned: true },
    { id: 2, name: "5 Cases", icon: Award, color: "text-blue-600", bgColor: "bg-blue-50", earned: true },
    { id: 3, name: "Cardiology Focus", icon: Target, color: "text-red-600", bgColor: "bg-red-50", earned: true },
    { id: 4, name: "Week Streak", icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-50", earned: true },
    { id: 5, name: "10 Cases", icon: Award, color: "text-purple-600", bgColor: "bg-purple-50", earned: false },
    { id: 6, name: "Perfect Score", icon: Trophy, color: "text-orange-600", bgColor: "bg-orange-50", earned: false }
  ];

  const recentCases = [
    {
      id: 2847,
      title: "Acute Chest Pain - NSTEMI",
      date: "February 21, 2026",
      score: 82,
      specialty: "Cardiology",
      duration: "45 min"
    },
    {
      id: 2846,
      title: "Diabetic Ketoacidosis",
      date: "February 20, 2026",
      score: 88,
      specialty: "Endocrinology",
      duration: "38 min"
    },
    {
      id: 2845,
      title: "Community-Acquired Pneumonia",
      date: "February 19, 2026",
      score: 75,
      specialty: "Pulmonology",
      duration: "42 min"
    },
    {
      id: 2844,
      title: "Acute Appendicitis",
      date: "February 18, 2026",
      score: 79,
      specialty: "Surgery",
      duration: "35 min"
    }
  ];

  const specialtyStats = [
    { name: "Cardiology", cases: 8, avgScore: 81 },
    { name: "Pulmonology", cases: 5, avgScore: 76 },
    { name: "Endocrinology", cases: 4, avgScore: 84 },
    { name: "Neurology", cases: 3, avgScore: 72 },
    { name: "Surgery", cases: 4, avgScore: 78 }
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
            <h2 className="text-lg font-semibold">Your Profile</h2>
          </div>
          <Button onClick={onStartNewCase} className="bg-[#071C5A] hover:bg-[#0d2d8a] text-white shadow-lg">
            Start New Case
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-6 border-l-4 border-l-[--navy]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[--navy] to-[--teal] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                SC
              </div>
              <div>
                <h2 className="text-3xl font-semibold mb-2">{profile.name}</h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-[--teal] text-white">{profile.level}</Badge>
                  <span className="text-sm text-muted-foreground">{profile.casesCompleted} cases completed</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Overall Proficiency</p>
              <p className="text-4xl font-semibold text-[--navy]">{profile.overallProficiency}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-semibold text-[--navy] mb-1">{profile.casesCompleted}</p>
              <p className="text-sm text-muted-foreground">Cases Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-[--teal] mb-1">{profile.totalHours}</p>
              <p className="text-sm text-muted-foreground">Training Hours</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-orange-600 mb-1">{profile.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>

        {/* Badges/Awards */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-[--navy]" />
            <h3 className="font-semibold text-xl">Badges & Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border text-center ${
                  badge.earned
                    ? `${badge.bgColor} border-current`
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center">
                  <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                </div>
                <p className={`text-xs font-semibold ${badge.earned ? badge.color : "text-muted-foreground"}`}>
                  {badge.name}
                </p>
                {badge.earned && (
                  <CheckCircle2 className="w-3 h-3 mx-auto mt-1 text-current" />
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Training History */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-[--navy]" />
              <h3 className="font-semibold text-xl">Training History</h3>
            </div>
            <div className="space-y-3">
              {recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="p-4 bg-background rounded-lg border border-border hover:border-[--navy] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{case_.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {case_.date}
                        </span>
                        <span>•</span>
                        <span>{case_.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-[--navy]">{case_.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {case_.specialty}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Cases
            </Button>
          </Card>

          {/* Specialty Statistics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[--teal]" />
              <h3 className="font-semibold text-xl">Specialty Stats</h3>
            </div>
            <div className="space-y-4">
              {specialtyStats.map((specialty) => (
                <div key={specialty.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{specialty.name}</p>
                      <p className="text-xs text-muted-foreground">{specialty.cases} cases</p>
                    </div>
                    <span className="text-sm font-semibold text-[--navy]">{specialty.avgScore}%</span>
                  </div>
                  <Progress value={specialty.avgScore} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Next Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[--teal]" />
            <h3 className="font-semibold text-xl">Next Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Reach Advanced Level</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-blue-900">78%</span>
                <span className="text-sm text-blue-600">/ 85%</span>
              </div>
              <Progress value={(78 / 85) * 100} className="h-2" />
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Complete 30 Cases</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-purple-900">{profile.casesCompleted}</span>
                <span className="text-sm text-purple-600">/ 30</span>
              </div>
              <Progress value={(profile.casesCompleted / 30) * 100} className="h-2" />
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">14-Day Streak</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-green-900">{profile.currentStreak}</span>
                <span className="text-sm text-green-600">/ 14</span>
              </div>
              <Progress value={(profile.currentStreak / 14) * 100} className="h-2" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
