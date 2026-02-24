import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ArrowLeft, Send, ChevronDown, ChevronUp, User, Bot, CheckCircle2, Circle, AlertCircle, FileText, ClipboardList, Brain, Lightbulb, Activity } from "lucide-react";
import { auth } from "../../lib/firebase";

interface Message {
  id: string;
  role: "student" | "attending";
  content: string;
  timestamp: Date;
}

interface MetricsStatusItem {
  name: string;
  status: "met" | "partial" | "missing" | "misconception";
  confidence: number;
}

interface EvaluationMetric {
  metric_id: string;
  metric_name: string;
  status: "met" | "partial" | "missing" | "misconception";
  confidence: number;
  evidence?: string;
  gaps?: string;
}

interface SessionFinalizeResponse {
  summary: {
    metrics_status?: Record<string, MetricsStatusItem>;
    turns_to_meet_all_metrics?: number | null;
  };
  latest_evaluation?: {
    evaluations?: EvaluationMetric[];
  };
  initial_evaluation?: {
    evaluations?: EvaluationMetric[];
  } | null;
}

interface SessionMessageResponse {
  message: string;
  metrics_status?: Record<string, MetricsStatusItem>;
  evaluation?: {
    evaluations?: EvaluationMetric[];
  };
}

interface CompletedCasePayload {
  score: number;
  initialScore: number;
  proficiency: string;
  strengths: string[];
  areasForGrowth: string[];
  performanceBreakdown: Array<{ label: string; value: number }>;
  transcript: Array<{ role: "student" | "attending"; content: string; timestamp: string }>;
  turnsToMeetAllMetrics: number | null;
  durationMinutes: number;
}

interface ChatScreenProps {
  initialPresentation: string;
  onBack: () => void;
  onComplete: (payload: CompletedCasePayload) => void;
}

export function ChatScreen({ initialPresentation, onBack, onComplete }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isCaseSummaryOpen, setIsCaseSummaryOpen] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsStatus, setMetricsStatus] = useState<Record<string, MetricsStatusItem>>({});
  const startedAtRef = useRef<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const normalizeMetricId = (value?: string) => {
    const raw = (value ?? "").toLowerCase();
    if (/^1(\D|$)/.test(raw) || raw.includes("focused")) return "1";
    if (/^2(\D|$)/.test(raw) || raw.includes("working diagnosis")) return "2";
    if (/^3(\D|$)/.test(raw) || raw.includes("logical organization") || raw.includes("clinical reasoning")) return "3";
    if (/^4(\D|$)/.test(raw) || raw.includes("differential")) return "4";
    if (/^5(\D|$)/.test(raw) || raw.includes("conciseness")) return "5";
    if (/^6(\D|$)/.test(raw) || raw.includes("workup")) return "6";
    if (/^7(\D|$)/.test(raw) || raw.includes("management")) return "7";
    if (/^8(\D|$)/.test(raw) || raw.includes("hypothesis")) return "8";
    if (/^9(\D|$)/.test(raw) || raw.includes("synthesize")) return "9";
    return value ?? "";
  };

  const metricsFromEvaluations = (evaluations?: EvaluationMetric[]) => {
    if (!evaluations?.length) return null;
    const mapped: Record<string, MetricsStatusItem> = {};
    for (const item of evaluations) {
      const id = normalizeMetricId(item.metric_id || item.metric_name);
      if (!id) continue;
      mapped[id] = {
        name: item.metric_name,
        status: item.status,
        confidence: Number(item.confidence ?? 0),
      };
    }
    return Object.keys(mapped).length ? mapped : null;
  };

  const mergeMetricsStatus = (
    directMetrics?: Record<string, MetricsStatusItem>,
    evaluations?: EvaluationMetric[],
  ) => {
    const normalizedDirect: Record<string, MetricsStatusItem> = {};
    if (directMetrics) {
      for (const [key, metric] of Object.entries(directMetrics)) {
        const id = normalizeMetricId(key || metric?.name);
        if (!id || !metric) continue;
        normalizedDirect[id] = {
          name: metric.name,
          status: metric.status,
          confidence: Number(metric.confidence ?? 0),
        };
      }
    }

    const fromEval = metricsFromEvaluations(evaluations) ?? {};
    const merged = { ...fromEval, ...normalizedDirect };
    if (!Object.keys(merged).length) return;
    setMetricsStatus((prev) => ({ ...prev, ...merged }));
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

  const authedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be signed in to continue.");
    }
    const token = await user.getIdToken();
    const headers = new Headers(init?.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && init?.body) {
      headers.set("Content-Type", "application/json");
    }
    const url = typeof input === "string" && input.startsWith("/api/")
      ? `${API_BASE}${input}`
      : input;
    return fetch(url, { ...init, headers });
  };

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // On mount: start a session and send the student's initial presentation
  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Create a new backend session
        const startRes = await authedFetch("/api/session/start", { method: "POST" });
        if (!startRes.ok) throw new Error(`Server error ${startRes.status}`);
        const startData: { session_id: string } = await startRes.json();
        if (cancelled) return;

        const sid = startData.session_id;
        setSessionId(sid);

        // Show the student's initial presentation
        const studentMsg: Message = {
          id: "init-student",
          role: "student",
          content: initialPresentation,
          timestamp: new Date(),
        };

        // Send the student's case presentation to the pipeline
        const stepRes = await authedFetch("/api/session/message", {
          method: "POST",
          body: JSON.stringify({ session_id: sid, text: initialPresentation }),
        });
        if (!stepRes.ok) throw new Error(`Server error ${stepRes.status}`);
        const stepData: SessionMessageResponse = await stepRes.json();
        if (cancelled) return;

        const firstResponseMsg: Message = {
          id: "init-response",
          role: "attending",
          content: stepData.message,
          timestamp: new Date(),
        };

        setMessages([studentMsg, firstResponseMsg]);
        mergeMetricsStatus(stepData.metrics_status, stepData.evaluation?.evaluations);
      } catch (err) {
        if (!cancelled) setError("Could not connect to the backend. Make sure the server is running and you are signed in.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initSession();
    return () => { cancelled = true; };
  }, [initialPresentation]);

  const reasoningProgress = {
    workingDiagnosis: Math.round(((metricsStatus["2"]?.confidence ?? 0) + (metricsStatus["8"]?.confidence ?? 0)) * 50),
    differential: Math.round((metricsStatus["4"]?.confidence ?? 0) * 100),
    diagnosticWorkup: Math.round((metricsStatus["6"]?.confidence ?? 0) * 100),
    managementPlan: Math.round((metricsStatus["7"]?.confidence ?? 0) * 100),
    logicalReasoning: Math.round(((metricsStatus["3"]?.confidence ?? 0) + (metricsStatus["9"]?.confidence ?? 0)) * 50),
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userText = input;
    setInput("");

    const studentMsg: Message = {
      id: Date.now().toString(),
      role: "student",
      content: userText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, studentMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await authedFetch("/api/session/message", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, text: userText }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: SessionMessageResponse = await res.json();

      const attendingMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "attending",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, attendingMsg]);
      mergeMetricsStatus(data.metrics_status, data.evaluation?.evaluations);
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toScore = (evaluations?: EvaluationMetric[], fallbackMetrics?: Record<string, MetricsStatusItem>) => {
    const scoreItems = (items: { status: string }[]) =>
      Math.round(
        (items.reduce((sum, item) => {
          if (item.status === "met") return sum + 1;
          if (item.status === "partial") return sum + 0.5;
          return sum;
        }, 0) /
          items.length) *
          100,
      );
    if (evaluations?.length) return scoreItems(evaluations);
    if (fallbackMetrics && Object.keys(fallbackMetrics).length) return scoreItems(Object.values(fallbackMetrics));
    return 0;
  };

  const toBreakdown = (metrics?: Record<string, MetricsStatusItem>) => {
    const mapMetric = (id: string, fallback: string) => {
      const item = metrics?.[id];
      return {
        label: item?.name ?? fallback,
        value: Math.round((item?.confidence ?? 0) * 100),
      };
    };
    return [
      mapMetric("2", "Working Diagnosis"),
      mapMetric("4", "Differential Reasoning"),
      mapMetric("6", "Diagnostic Workup"),
      mapMetric("7", "Management Planning"),
      mapMetric("3", "Clinical Communication"),
    ];
  };

  const handleCompleteCase = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    setError(null);

    if (!sessionId) {
      const durationMinutes = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
      const transcript = messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      const finalScore = toScore(undefined, metricsStatus);
      const proficiency = finalScore >= 85 ? "Advanced" : finalScore >= 70 ? "Proficient" : "Beginner";
      onComplete({
        score: finalScore,
        initialScore: finalScore,
        proficiency,
        strengths: [],
        areasForGrowth: [],
        performanceBreakdown: toBreakdown(metricsStatus),
        transcript,
        turnsToMeetAllMetrics: null,
        durationMinutes,
      });
      setIsFinalizing(false);
      return;
    }

    const abortController = new AbortController();
    const abortTimeout = setTimeout(() => abortController.abort(), 8000);

    try {
      const finalizeRes = await authedFetch("/api/session/finalize", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
        signal: abortController.signal,
      });
      clearTimeout(abortTimeout);
      if (!finalizeRes.ok) throw new Error(`Server error ${finalizeRes.status}`);
      const finalizeData: SessionFinalizeResponse = await finalizeRes.json();

      mergeMetricsStatus(
        finalizeData.summary.metrics_status,
        finalizeData.latest_evaluation?.evaluations,
      );

      const latestMetrics = metricsFromEvaluations(finalizeData.latest_evaluation?.evaluations)
        ?? finalizeData.summary.metrics_status
        ?? metricsStatus;
      const initialMetrics = metricsFromEvaluations(finalizeData.initial_evaluation?.evaluations);
      const initialScore = toScore(finalizeData.initial_evaluation?.evaluations, initialMetrics ?? undefined);
      const finalScore = toScore(finalizeData.latest_evaluation?.evaluations, latestMetrics);
      const proficiency = finalScore >= 85 ? "Advanced" : finalScore >= 70 ? "Proficient" : "Beginner";
      const evalMetrics = finalizeData.latest_evaluation?.evaluations ?? [];
      const strengths = evalMetrics
        .filter((item) => item.status === "met")
        .slice(0, 3)
        .map((item) => item.metric_name);
      const areasForGrowth = evalMetrics
        .filter((item) => item.status !== "met")
        .slice(0, 3)
        .map((item) => item.metric_name);

      const durationMinutes = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
      const transcript = messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      onComplete({
        score: finalScore,
        initialScore,
        proficiency,
        strengths,
        areasForGrowth,
        performanceBreakdown: toBreakdown(latestMetrics),
        transcript,
        turnsToMeetAllMetrics: finalizeData.summary.turns_to_meet_all_metrics ?? null,
        durationMinutes,
      });
    } catch {
      clearTimeout(abortTimeout);
      const durationMinutes = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
      const transcript = messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      const finalScore = toScore(undefined, metricsStatus);
      const proficiency = finalScore >= 85 ? "Advanced" : finalScore >= 70 ? "Proficient" : "Beginner";

      onComplete({
        score: finalScore,
        initialScore: finalScore,
        proficiency,
        strengths: [],
        areasForGrowth: [],
        performanceBreakdown: toBreakdown(metricsStatus),
        transcript,
        turnsToMeetAllMetrics: null,
        durationMinutes,
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-[#071C5A] bg-[#071C5A]">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2 text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <h2 className="text-lg font-semibold text-white">Case Discussion</h2>
          </div>
          <Button onClick={handleCompleteCase} disabled={isFinalizing} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
            Complete Case
          </Button>
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 max-w-[2000px] mx-auto w-full flex">
        {/* Left Sidebar - Collapsible Case Summary */}
        <aside className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
          <Collapsible open={isCaseSummaryOpen} onOpenChange={setIsCaseSummaryOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full mb-4 hover:bg-muted p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center shadow">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Case Summary</h3>
              </div>
              {isCaseSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-[#071C5A]" />
                  <h4 className="text-sm font-bold text-slate-900">Patient</h4>
                </div>
                <p className="text-sm text-muted-foreground">89-year-old male — Case 12-2010</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-[#071C5A]" />
                  <h4 className="text-sm font-bold text-slate-900">Chief Complaint</h4>
                </div>
                <p className="text-sm text-muted-foreground">Progressive dyspnea × 6 months, acutely worse × 3 days</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  <h4 className="text-sm font-bold text-slate-900">Key Findings</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                    <span>O2 sat 78% RA → 91% on 6L NC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                    <span>JVP 14 cm above RA; crackles to mid-lung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                    <span>RV dilated/hypokinetic; mod-severe TR; PAH</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[--teal] text-xs">•</span>
                    <span>BP 105/43, HR 81 (paced), RR 28, T 36.1°C</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[--teal] text-xs">•</span>
                    <span>CT: honeycomb changes, traction bronchiectasis, ground-glass; calcified pleural plaques</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ClipboardList className="w-3.5 h-3.5 text-[#071C5A]" />
                  <h4 className="text-sm font-bold text-slate-900">PMH</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• CAD, complete heart block (dual pacemaker)</li>
                  <li>• DM, HTN, hyperlipidemia, CVD</li>
                  <li>• Asbestos exposure (retired plumber, shipyard)</li>
                  <li>• 150 pack-year smoking history</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </aside>

        {/* Center - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "student" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "attending" && (
                  <div className="w-10 h-10 rounded-full bg-[#071C5A] ring-2 ring-blue-300 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    message.role === "student"
                      ? "bg-teal-100 border-2 border-teal-400"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900">
                      {message.role === "student" ? "You" : "AI Attending"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "student" && (
                  <div className="w-10 h-10 rounded-full bg-teal-500 ring-2 ring-teal-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-[#071C5A] ring-2 ring-blue-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">AI Attending is thinking</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-card p-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your response..."
                className="min-h-[80px] resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-[#071C5A] hover:bg-[#0d2d8a] text-white px-6 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Right Sidebar - Clinical Reasoning Tracker */}
        <aside className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Clinical Reasoning Tracker</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.workingDiagnosis >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-slate-900">Working Diagnosis</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.workingDiagnosis}%</span>
              </div>
              <Progress value={reasoningProgress.workingDiagnosis} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.differential >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-slate-900">Differential</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.differential}%</span>
              </div>
              <Progress value={reasoningProgress.differential} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.diagnosticWorkup >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-slate-900">Diagnostic Workup</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.diagnosticWorkup}%</span>
              </div>
              <Progress value={reasoningProgress.diagnosticWorkup} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.managementPlan >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-slate-900">Management Plan</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.managementPlan}%</span>
              </div>
              <Progress value={reasoningProgress.managementPlan} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.logicalReasoning >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-slate-900">Logical Reasoning</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.logicalReasoning}%</span>
              </div>
              <Progress value={reasoningProgress.logicalReasoning} className="h-2" />
            </div>
          </div>

          <Card className="mt-6 p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm font-bold text-amber-900">Tips</h4>
            </div>
            <ul className="space-y-2 text-xs text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Support your reasoning with specific clinical findings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Consider alternative diagnoses and explain why they're less likely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Prioritize immediate life-threatening conditions</span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
