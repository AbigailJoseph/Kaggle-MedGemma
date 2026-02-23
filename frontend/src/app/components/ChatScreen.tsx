import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ArrowLeft, Send, ChevronDown, ChevronUp, User, Bot, CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "student" | "attending";
  content: string;
  timestamp: Date;
}

interface ChatScreenProps {
  initialPresentation: string;
  onBack: () => void;
  onComplete: () => void;
}

export function ChatScreen({ initialPresentation, onBack, onComplete }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isCaseSummaryOpen, setIsCaseSummaryOpen] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const startRes = await fetch("/api/session/start", { method: "POST" });
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
        const stepRes = await fetch("/api/session/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid, text: initialPresentation }),
        });
        if (!stepRes.ok) throw new Error(`Server error ${stepRes.status}`);
        const stepData: { message: string } = await stepRes.json();
        if (cancelled) return;

        const firstResponseMsg: Message = {
          id: "init-response",
          role: "attending",
          content: stepData.message,
          timestamp: new Date(),
        };

        setMessages([studentMsg, firstResponseMsg]);
      } catch (err) {
        if (!cancelled) setError("Could not connect to the backend. Make sure the server is running.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initSession();
    return () => { cancelled = true; };
  }, [initialPresentation]);

  const reasoningProgress = {
    workingDiagnosis: 0,
    differential: 0,
    diagnosticWorkup: 0,
    managementPlan: 0,
    logicalReasoning: 0,
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
      const res = await fetch("/api/session/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, text: userText }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: { message: string } = await res.json();

      const attendingMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "attending",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, attendingMsg]);
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
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
          <Button onClick={onComplete} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
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
              <h3 className="font-semibold">Case Summary</h3>
              {isCaseSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">Patient</h4>
                <p className="text-sm text-muted-foreground">89-year-old male — Case 12-2010</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">Chief Complaint</h4>
                <p className="text-sm text-muted-foreground">Progressive dyspnea × 6 months, acutely worse × 3 days</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">Key Findings</h4>
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
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">PMH</h4>
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
                  <div className="w-10 h-10 rounded-full bg-[--navy] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    message.role === "student"
                      ? "bg-[--teal]/10 border border-[--teal]/20"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">
                      {message.role === "student" ? "You" : "AI Attending"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "student" && (
                  <div className="w-10 h-10 rounded-full bg-[--teal] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-[--navy] flex items-center justify-center flex-shrink-0">
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
          <h3 className="font-semibold mb-4">Clinical Reasoning Tracker</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {reasoningProgress.workingDiagnosis >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold">Working Diagnosis</span>
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
                  <span className="text-sm font-semibold">Differential</span>
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
                  <span className="text-sm font-semibold">Diagnostic Workup</span>
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
                  <span className="text-sm font-semibold">Management Plan</span>
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
                  <span className="text-sm font-semibold">Logical Reasoning</span>
                </div>
                <span className="text-xs text-muted-foreground">{reasoningProgress.logicalReasoning}%</span>
              </div>
              <Progress value={reasoningProgress.logicalReasoning} className="h-2" />
            </div>
          </div>

          <Card className="mt-6 p-4 bg-[--navy]/5 border-[--navy]/20">
            <h4 className="text-sm font-semibold mb-2">Tips</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[--teal]">•</span>
                <span>Support your reasoning with specific clinical findings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[--teal]">•</span>
                <span>Consider alternative diagnoses and explain why they're less likely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[--teal]">•</span>
                <span>Prioritize immediate life-threatening conditions</span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
