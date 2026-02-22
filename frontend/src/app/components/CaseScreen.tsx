import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { ArrowLeft, User, Heart, Activity, Thermometer, Droplet, TestTube, FileText } from "lucide-react";

interface CaseScreenProps {
  onBack: () => void;
  onSubmit: (presentation: string) => void;
}

export function CaseScreen({ onBack, onSubmit }: CaseScreenProps) {
  const [presentation, setPresentation] = useState("");

  const handleSubmit = () => {
    if (presentation.trim()) {
      onSubmit(presentation);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold">Case Presentation</h2>
          </div>
        </div>
      </header>

      {/* Split Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Case Details */}
          <div className="space-y-4">
            <Card className="p-6 border-l-4 border-l-[--navy]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[--navy]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[--navy]" />
                </div>
                <div>
                  <h3 className="font-semibold">Patient: 89-year-old male</h3>
                  <p className="text-sm text-muted-foreground">Case 12-2010</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[--teal]" />
                    <h4 className="font-semibold text-sm">Chief Complaint</h4>
                  </div>
                  <p className="text-sm ml-6">Progressive dyspnea over 6 months, markedly worsened over 3 days</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[--teal]" />
                    <h4 className="font-semibold text-sm">History of Present Illness</h4>
                  </div>
                  <p className="text-sm ml-6">
                    Six months of progressive exertional dyspnea (3 blocks → 1 flight → 2–3 steps).
                    Three days prior: worsening dyspnea, somnolence, decreased appetite and urine output,
                    unsteady gait. On day of admission found with labored breathing; rales in both lung fields.
                    EMS administered O₂ (15 L/min) and furosemide with improvement. Denies fever, chills,
                    night sweats, chest pain, or leg edema. Chronic dry cough unchanged. 2.3 kg weight loss
                    over prior 2 months.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[--navy]" />
                <h4 className="font-semibold">Vital Signs</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-semibold">105/43 mmHg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heart Rate (paced)</p>
                    <p className="font-semibold">81 bpm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature / RR</p>
                    <p className="font-semibold">36.1°C / 28 rpm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">O2 Saturation</p>
                    <p className="font-semibold">78% RA → 91% 6L NC</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TestTube className="w-5 h-5 text-[--navy]" />
                <h4 className="font-semibold">Laboratory Values</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Glucose (fingerstick)</span>
                  <span className="font-semibold text-sm">230 mg/dL</span>
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">High</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">JVP</span>
                  <span className="font-semibold text-sm">14 cm above RA</span>
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Elevated</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Troponin (serial)</span>
                  <span className="font-semibold text-sm">No rise</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Normal</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Echo — EF</span>
                  <span className="font-semibold text-sm">54%</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Preserved</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Echo — RV</span>
                  <span className="font-semibold text-sm">Dilated, hypokinetic</span>
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Abnormal</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Past Medical History</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span>CAD (stent 10 years ago); complete heart block → dual-lead pacemaker (6 years ago)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span>DM, HTN, hyperlipidemia, cerebrovascular disease</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span>Retired plumber — occupational asbestos exposure (shipyard)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span>150 pack-year smoking history (3 PPD × 50 yrs); quit 14 years ago</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span>Brother has heart disease and asbestosis</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Imaging &amp; Studies</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span><strong>CXR:</strong> Bilateral patchy air-space opacities, indistinct pulmonary vessels, possible small pleural effusions, calcified pleural plaques on right hemidiaphragm, coarse reticular opacities with cystic lucency at both bases</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span><strong>CT chest:</strong> Bilateral cystic changes, septal thickening, bronchial-wall thickening, honeycomb changes, traction bronchiectasis, diffuse asymmetric ground-glass opacification; calcified pericardium and pleura; paratracheal/hilar/subcarinal LAD (1.5–2.3 cm)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span><strong>Echo:</strong> EF 54%, mild concentric LVH; RV markedly dilated and hypokinetic, moderate-to-severe TR, pulmonary arterial hypertension, interventricular septal flattening</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[--teal] mt-1">•</span>
                  <span><strong>ECG:</strong> Paced rhythm at 88 bpm, no ectopy</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Right Panel - Presentation Input */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">Submit Your Presentation</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Provide a structured clinical presentation including:
              </p>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[--navy]">•</span>
                  <span>Summary statement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--navy]">•</span>
                  <span>Working diagnosis with supporting evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--navy]">•</span>
                  <span>Differential diagnoses (2-3 alternatives)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--navy]">•</span>
                  <span>Diagnostic workup plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--navy]">•</span>
                  <span>Initial management plan</span>
                </li>
              </ul>

              <Textarea
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Begin your presentation here..."
                className="min-h-[400px] mb-4 font-mono text-sm"
              />

              <Button
                onClick={handleSubmit}
                disabled={!presentation.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Submit to Attending
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
