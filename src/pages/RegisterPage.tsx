import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, FileText, X, ChevronRight, Users, Target, ChevronLeft } from "lucide-react";
import { addRegistration } from "../integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const problemStatements = [
  { id: "genai-llm", title: "Generative AI & LLM Applications", description: "Build innovative applications using Large Language Models", icon: "🤖" },
  { id: "robotics", title: "Robotics & Autonomous Systems", description: "Create autonomous robots or drone solutions", icon: "🦾" },
  { id: "cybersecurity", title: "Cybersecurity & Threat Intelligence", description: "Develop security solutions to protect systems", icon: "🔒" },
  { id: "healthtech", title: "HealthTech & MedAI", description: "Build AI-powered healthcare solutions", icon: "🏥" },
  { id: "fintech", title: "FinTech & Blockchain", description: "Create decentralized finance solutions", icon: "💰" },
  { id: "smart-cities", title: "Smart Cities & IoT", description: "Develop IoT solutions for smarter cities", icon: "🏙️" },
  { id: "green-tech", title: "Green Tech & Energy", description: "Build sustainable solutions for environmental challenges", icon: "🌱" },
  { id: "agritech", title: "Agritech & Rural Innovation", description: "Create solutions for agriculture", icon: "🌾" },
  { id: "transportation", title: "Transportation & Logistics", description: "Optimize logistics systems", icon: "🚚" },
  { id: "open-innovation", title: "Open Innovation (Wildcard)", description: "Bring your own innovative ideas", icon: "💡" },
];

interface TeamMember {
  name: string;
  email: string;
}

const MAX_TEAM_SIZE = 4;

const RegisterPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  const isValidEmail = (value: string) => /.+@.+\..+/.test(value.trim());
  const isValidPhone = (value: string) => /^\+?\d{10,15}$/.test(value.trim());
  const isValidName = (value: string) => /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(value.trim());
  const sanitizeName = (value: string) => value.replace(/[^A-Za-z\s.'-]/g, "");

  const sanitizeMembers = (members: TeamMember[]) =>
    members.map((member) => ({ name: member.name.trim(), email: member.email.trim() }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const nextValue =
      id === "phone"
        ? value.replace(/[^\d+]/g, "")
        : id === "leaderName" || id === "teamName"
          ? sanitizeName(value)
          : value;
    setFormData((prev) => ({ ...prev, [id]: nextValue }));
  };

  const validateTeamDetails = () => {
    const trimmedForm = {
      teamName: formData.teamName.trim(),
      leaderName: formData.leaderName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      college: formData.college.trim(),
      year: formData.year.trim(),
    };

    const missingFields = Object.entries(trimmedForm)
      .filter(([, value]) => !value)
      .map(([key]) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()));

    if (missingFields.length) {
      toast({
        title: "Missing information",
        description: `Please complete: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    if (!isValidEmail(trimmedForm.email)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return null;
    }

    if (!isValidPhone(trimmedForm.phone)) {
      toast({ title: "Invalid phone number", description: "Use digits only (10-15 characters).", variant: "destructive" });
      return null;
    }

    if (!isValidName(trimmedForm.leaderName)) {
      toast({ title: "Invalid leader name", description: "Use letters and spaces only.", variant: "destructive" });
      return null;
    }

    if (!isValidName(trimmedForm.teamName)) {
      toast({ title: "Invalid team name", description: "Use letters and spaces only for team name.", variant: "destructive" });
      return null;
    }

    const cleanedMembers = sanitizeMembers(teamMembers);
    const invalidNames = cleanedMembers.filter((member) => !isValidName(member.name));
    if (invalidNames.length) {
      toast({ title: "Invalid member name", description: "Use letters and spaces only for member names.", variant: "destructive" });
      return null;
    }

    const allMembers = [{ name: trimmedForm.leaderName, email: trimmedForm.email }, ...cleanedMembers];

    if (allMembers.length > MAX_TEAM_SIZE) {
      toast({ title: "Team size exceeded", description: `Maximum ${MAX_TEAM_SIZE} members including the leader.`, variant: "destructive" });
      return null;
    }

    const invalidMembers = allMembers.filter((member) => member.email && !isValidEmail(member.email));
    if (invalidMembers.length) {
      toast({ title: "Check member emails", description: "One or more member emails are invalid.", variant: "destructive" });
      return null;
    }

    return { ...trimmedForm, allMembers, cleanedMembers };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!selectedProblem) {
      toast({ title: "Select a Problem Statement", description: "Please select a problem statement.", variant: "destructive" });
      return;
    }

    const validated = validateTeamDetails();
    if (!validated) return;

    setIsSubmitting(true);

    try {
      const result = await addRegistration({
        teamName: validated.teamName,
        leaderName: validated.leaderName,
        email: validated.email,
        phone: validated.phone,
        college: validated.college,
        year: validated.year,
        members: validated.allMembers,
        problemStatement: selectedProblem,
        submittedAt: new Date(),
      });

      if (result.success) {
        setSubmitted(true);
        toast({ title: "Registration Successful!", description: "Check your email for confirmation." });
      } else {
        throw new Error(result.error || "Failed to submit");
      }
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = () => {
    const trimmedMember = { name: sanitizeName(newMember.name.trim()), email: newMember.email.trim() };

    if (!trimmedMember.name || !trimmedMember.email) {
      toast({ title: "Add member details", description: "Provide both name and email.", variant: "destructive" });
      return;
    }

    if (!isValidName(trimmedMember.name)) {
      toast({ title: "Invalid member name", description: "Use letters and spaces only.", variant: "destructive" });
      return;
    }

    if (!isValidEmail(trimmedMember.email)) {
      toast({ title: "Invalid member email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }

    if (teamMembers.length >= MAX_TEAM_SIZE - 1) {
      toast({ title: "Team size limit reached", description: `You can add up to ${MAX_TEAM_SIZE - 1} additional members.`, variant: "destructive" });
      return;
    }

    setTeamMembers([...teamMembers, trimmedMember]);
    setNewMember({ name: "", email: "" });
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedExtensions = ['.pdf', '.ppt', '.pptx'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExtension)) {
        toast({ title: "Invalid File Type", description: "Please upload PDF or PPT files only", variant: "destructive" });
        return;
      }

      const maxSizeMb = 10;
      if (selectedFile.size / 1024 / 1024 > maxSizeMb) {
        toast({ title: "File too large", description: `Keep files under ${maxSizeMb} MB.`, variant: "destructive" });
        return;
      }

      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setSelectedProblem("");
    setFile(null);
    setTeamMembers([]);
    setFormData({ teamName: "", leaderName: "", email: "", phone: "", college: "", year: "" });
    setNewMember({ name: "", email: "" });
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedProblem) {
      toast({ title: "Select a Problem Statement", description: "Please select a problem statement to continue.", variant: "destructive" });
      return;
    }
    if (currentStep === 2) {
      const validated = validateTeamDetails();
      if (!validated) return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const selectedProblemData = problemStatements.find(p => p.id === selectedProblem);

  return (
    <section id="register" className="py-20 min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#00d4ff' }}>Register Your Team</h2>
          <p className="text-gray-400 text-lg">Ready to take on the challenge? Register now for Zayathon 2026!</p>
        </div>

        {/* Progress Steps */}
        {!submitted && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= step ? "bg-cyan-500 text-black" : "bg-gray-700 text-gray-400"
                    }`}
                    style={{ background: currentStep >= step ? '#00d4ff' : '#374151', color: currentStep >= step ? '#000' : '#9ca3af' }}
                  >
                    {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && <div className={`w-16 h-1 mx-2 rounded ${currentStep > step ? "bg-cyan-500" : "bg-gray-700"}`} style={{ background: currentStep > step ? '#00d4ff' : '#374151' }} />}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-16 mt-2 text-sm" style={{ color: '#9ca3af' }}>
              <span>Select Track</span>
              <span>Team Details</span>
              <span>Review & Submit</span>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {!submitted ? (
            <Card style={{ background: '#111118', border: '1px solid #2a2a3a' }}>
              <CardHeader className="text-center">
                <CardTitle style={{ color: '#fff' }}>
                  {currentStep === 1 && "Step 1: Select Your Problem Statement"}
                  {currentStep === 2 && "Step 2: Team Information"}
                  {currentStep === 3 && "Step 3: Review & Submit"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step 1: Problem Statement Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5" style={{ color: '#00d4ff' }} />
                      <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>Choose a Track</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {problemStatements.map((problem) => (
                        <div
                          key={problem.id}
                          onClick={() => setSelectedProblem(problem.id)}
                          className="cursor-pointer p-4 rounded-lg border-2 transition-all"
                          style={{ 
                            background: selectedProblem === problem.id ? 'rgba(0, 212, 255, 0.1)' : '#1a1a24',
                            borderColor: selectedProblem === problem.id ? '#00d4ff' : '#2a2a3a'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{problem.icon}</span>
                            <div>
                              <h4 className="font-semibold" style={{ color: '#fff' }}>{problem.title}</h4>
                              <p className="text-sm" style={{ color: '#9ca3af' }}>{problem.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedProblem && (
                      <div 
                        className="p-4 rounded-lg flex items-center justify-between"
                        style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff' }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" style={{ color: '#00d4ff' }} />
                          <span className="font-medium" style={{ color: '#fff' }}>Selected: {selectedProblemData?.title}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedProblem("")} 
                          style={{ color: '#9ca3af' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Team Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
                        <Users className="w-5 h-5" style={{ color: '#00d4ff' }} /> Team Leader Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teamName" style={{ color: '#d1d5db' }}>Team Name *</Label>
                          <Input
                            id="teamName"
                            placeholder="Enter your team name"
                            value={formData.teamName}
                            onChange={handleChange}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leaderName" style={{ color: '#d1d5db' }}>Team Leader Name *</Label>
                          <Input
                            id="leaderName"
                            placeholder="Enter team leader name"
                            value={formData.leaderName}
                            onChange={handleChange}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" style={{ color: '#d1d5db' }}>Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" style={{ color: '#d1d5db' }}>Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="college" style={{ color: '#d1d5db' }}>College/University *</Label>
                          <Input
                            id="college"
                            placeholder="Enter your college name"
                            value={formData.college}
                            onChange={handleChange}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year" style={{ color: '#d1d5db' }}>Year of Study *</Label>
                          <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                            <SelectTrigger style={{ background: '#1a1a24', border: '1px solid #2a2a3a', color: '#fff' }}>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}>
                              <SelectItem value="1" style={{ color: '#fff' }}>1st Year</SelectItem>
                              <SelectItem value="2" style={{ color: '#fff' }}>2nd Year</SelectItem>
                              <SelectItem value="3" style={{ color: '#fff' }}>3rd Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4" style={{ borderColor: '#2a2a3a' }}>
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
                        <Users className="w-5 h-5" style={{ color: '#00d4ff' }} /> Team Members (Optional)
                        <span className="text-sm font-normal" style={{ color: '#9ca3af' }}>Max 3 additional members</span>
                      </h3>

                      {teamMembers.length > 0 && (
                        <div className="space-y-2">
                          {teamMembers.map((member, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 rounded-lg"
                              style={{ background: '#1a1a24' }}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                                  style={{ background: 'rgba(0, 212, 255, 0.2)', color: '#00d4ff' }}
                                >
                                  {index + 2}
                                </div>
                                <div>
                                  <p className="font-medium" style={{ color: '#fff' }}>{member.name}</p>
                                  <p className="text-sm" style={{ color: '#9ca3af' }}>{member.email}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeTeamMember(index)}
                                style={{ color: '#9ca3af' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {teamMembers.length < 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Member name"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: sanitizeName(e.target.value) })}
                            style={{ 
                              background: '#1a1a24', 
                              border: '1px solid #2a2a3a', 
                              color: '#fff',
                              cursor: 'text'
                            }}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Member email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              style={{ 
                                background: '#1a1a24', 
                                border: '1px solid #2a2a3a', 
                                color: '#fff',
                                cursor: 'text'
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addTeamMember}
                              disabled={!newMember.name || !newMember.email}
                              style={{ background: '#00d4ff', color: '#000' }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Submit */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>Registration Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg" style={{ background: '#1a1a24' }}>
                          <h4 className="font-medium mb-2" style={{ color: '#00d4ff' }}>Selected Track</h4>
                          <div className="flex items-center gap-2" style={{ color: '#fff' }}>
                            <span>{selectedProblemData?.icon}</span>
                            <span>{selectedProblemData?.title}</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: '#1a1a24' }}>
                          <h4 className="font-medium mb-2" style={{ color: '#00d4ff' }}>Team Leader</h4>
                          <p className="font-semibold" style={{ color: '#fff' }}>{formData.leaderName}</p>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{formData.email}</p>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{formData.phone}</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: '#1a1a24' }}>
                          <h4 className="font-medium mb-2" style={{ color: '#00d4ff' }}>Team</h4>
                          <p className="font-semibold" style={{ color: '#fff' }}>{formData.teamName}</p>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{formData.college}</p>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{formData.year} Year</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: '#1a1a24' }}>
                          <h4 className="font-medium mb-2" style={{ color: '#00d4ff' }}>Team Members</h4>
                          {teamMembers.length > 0 ? (
                            <ul className="text-sm space-y-1" style={{ color: '#fff' }}>
                              {teamMembers.map((m, i) => <li key={i}>{m.name} ({m.email})</li>)}
                            </ul>
                          ) : (
                            <p className="text-sm" style={{ color: '#9ca3af' }}>No additional members</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4" style={{ borderColor: '#2a2a3a' }}>
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
                        <FileText className="w-5 h-5" style={{ color: '#00d4ff' }} /> Project Abstract (Optional)
                        <span className="text-sm font-normal" style={{ color: '#9ca3af' }}>Upload PDF or PPT for next round</span>
                      </h3>
                      {!file ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
                          style={{ borderColor: '#2a2a3a' }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = '#00d4ff'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = '#2a2a3a'}
                        >
                          <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                          <p className="mb-2" style={{ color: '#9ca3af' }}>Drag and drop your abstract (PDF/PPT)</p>
                          <p className="text-sm" style={{ color: '#6b7280' }}>or click to browse files</p>
                          <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept=".pdf,.ppt,.pptx" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: '#1a1a24' }}>
                          <FileText className="w-10 h-10" style={{ color: '#00d4ff' }} />
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: '#fff' }}>{file.name}</p>
                            <p className="text-sm" style={{ color: '#9ca3af' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button 
                            onClick={removeFile}
                            style={{ color: '#9ca3af' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t" style={{ borderColor: '#2a2a3a' }}>
                  {currentStep > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      style={{ borderColor: '#2a2a3a', color: '#fff' }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  {currentStep < 3 ? (
                    <Button 
                      onClick={nextStep}
                      style={{ background: '#00d4ff', color: '#000' }}
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      style={{ background: '#00d4ff', color: '#000' }}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div 
              className="text-center p-12 rounded-xl border"
              style={{ background: '#111118', borderColor: '#2a2a3a' }}
            >
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(0, 212, 255, 0.1)' }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: '#00d4ff' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Registration Successful!</h3>
              <p className="mb-6" style={{ color: '#9ca3af' }}>
                Thank you for registering for Zayathon 2026!<br />
                We've received your registration for:<br />
                <strong style={{ color: '#00d4ff' }}>{selectedProblemData?.title}</strong>
              </p>
              <Button 
                onClick={resetForm} 
                variant="outline"
                style={{ borderColor: '#2a2a3a', color: '#fff' }}
              >
                Register Another Team
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
