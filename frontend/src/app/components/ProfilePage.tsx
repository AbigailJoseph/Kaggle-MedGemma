import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Award, Trophy, Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
  onStartNewCase: () => void;
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
}

export function ProfilePage({ onBack, onStartNewCase, onSignOut, profile }: ProfilePageProps) {
  const [imageFailed, setImageFailed] = useState(false);

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
    { id: 1, name: "First Case", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50", earned: profileData.casesCompleted >= 1 },
    { id: 2, name: "5 Cases", icon: Award, color: "text-blue-600", bgColor: "bg-blue-50", earned: profileData.casesCompleted >= 5 },
    { id: 3, name: "10 Cases", icon: Award, color: "text-purple-600", bgColor: "bg-purple-50", earned: profileData.casesCompleted >= 10 },
    { id: 4, name: "Week Streak", icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-50", earned: profileData.currentStreak >= 7 },
    { id: 5, name: "14-Day Streak", icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-50", earned: profileData.currentStreak >= 14 },
    { id: 6, name: "Perfect Score", icon: Trophy, color: "text-orange-600", bgColor: "bg-orange-50", earned: profileData.overallProficiency >= 95 },
  ];

  const recentCases: Array<{
    id: number;
    title: string;
    date: string;
    score: number;
    specialty: string;
    duration: string;
  }> = [];

  const specialtyStats = useMemo(() => {
    if (profileData.casesCompleted <= 0) {
      return [] as Array<{ name: string; cases: number; avgScore: number }>;
    }

    return [{ name: "General", cases: profileData.casesCompleted, avgScore: profileData.overallProficiency }];
  }, [profileData.casesCompleted, profileData.overallProficiency]);

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex items-center gap-2">
            <Button onClick={onStartNewCase} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              Start New Case
            </Button>
            <Button variant="outline" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-8 mb-6 border-l-4 border-l-[--navy]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {hasPhoto ? (
                <img
                  src={profileData.photoURL}
                  alt={`${profileData.name} profile`}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="w-20 h-20 rounded-full object-cover border border-border bg-muted"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-[--navy] to-[--teal] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-semibold mb-2">{profileData.name}</h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-teal-100 text-teal-900 border border-teal-300">{profileData.level}</Badge>
                  <span className="text-sm text-muted-foreground">{profileData.casesCompleted} cases completed</span>
                  {profileData.email && <span className="text-sm text-muted-foreground">{profileData.email}</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Overall Proficiency</p>
              <p className="text-4xl font-semibold text-[--navy]">{profileData.overallProficiency}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-semibold text-[--navy] mb-1">{profileData.casesCompleted}</p>
              <p className="text-sm text-muted-foreground">Cases Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-[--teal] mb-1">{profileData.totalHours}</p>
              <p className="text-sm text-muted-foreground">Training Hours</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-orange-600 mb-1">{profileData.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-[--navy]" />
            <h3 className="font-semibold text-xl">Badges & Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border text-center ${badge.earned ? `${badge.bgColor} border-current` : "bg-muted/50 border-border opacity-50"}`}
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center">
                  <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                </div>
                <p className={`text-xs font-semibold ${badge.earned ? badge.color : "text-muted-foreground"}`}>{badge.name}</p>
                {badge.earned && <CheckCircle2 className="w-3 h-3 mx-auto mt-1 text-current" />}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-[--navy]" />
              <h3 className="font-semibold text-xl">Training History</h3>
            </div>
            {recentCases.length > 0 ? (
              <>
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
                            <span>|</span>
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
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                No completed cases yet. Start a case to see your training history here.
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[--teal]" />
              <h3 className="font-semibold text-xl">Specialty Stats</h3>
            </div>
            {specialtyStats.length > 0 ? (
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
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No specialty stats yet.
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[--teal]" />
            <h3 className="font-semibold text-xl">Next Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Reach Advanced Level</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-blue-900">{profileData.overallProficiency}%</span>
                <span className="text-sm text-blue-600">/ 85%</span>
              </div>
              <Progress value={(profileData.overallProficiency / 85) * 100} className="h-2" />
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Complete 30 Cases</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-purple-900">{profileData.casesCompleted}</span>
                <span className="text-sm text-purple-600">/ 30</span>
              </div>
              <Progress value={(profileData.casesCompleted / 30) * 100} className="h-2" />
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">14-Day Streak</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-green-900">{profileData.currentStreak}</span>
                <span className="text-sm text-green-600">/ 14</span>
              </div>
              <Progress value={(profileData.currentStreak / 14) * 100} className="h-2" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}