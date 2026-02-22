import { useState } from "react";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "student",
      content: initialPresentation,
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: "2",
      role: "attending",
      content: "Thank you for that presentation. I can see you've identified some key findings. Your working diagnosis of acute coronary syndrome is on the right track given the elevated troponin and clinical presentation.\n\nLet me ask you this: What specific features in this case make you favor NSTEMI over unstable angina? And what about the elevated BNP - how does that factor into your thinking?",
      timestamp: new Date(Date.now() - 240000)
    }
  ]);
  const [input, setInput] = useState("");
  const [isCaseSummaryOpen, setIsCaseSummaryOpen] = useState(true);

  const reasoningProgress = {
    workingDiagnosis: 85,
    differential: 70,
    diagnosticWorkup: 60,
    managementPlan: 45,
    logicalReasoning: 75
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "student",
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate attending response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "attending",
        content: "Good thinking. You're correctly identifying the significance of the elevated troponin in distinguishing NSTEMI from unstable angina. Now, let's discuss your management plan. What would be your immediate next steps for this patient?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold">Case Discussion</h2>
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
                <p className="text-sm text-muted-foreground">J.M., 62-year-old male</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">Chief Complaint</h4>
                <p className="text-sm text-muted-foreground">Chest pain and SOB × 2 hours</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">Key Findings</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                    <span>Troponin I: 0.8 ng/mL (elevated)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5" />
                    <span>BNP: 450 pg/mL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[--teal] text-xs">•</span>
                    <span>BP: 148/92, HR: 102</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[--teal] text-xs">•</span>
                    <span>O2 Sat: 94% RA</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[--navy]">PMH</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• HTN, T2DM</li>
                  <li>• Hyperlipidemia</li>
                  <li>• Former smoker</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </aside>

        {/* Center - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg"
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
