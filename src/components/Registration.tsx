import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addRegistration } from "../integrations/supabase/client";

const problemDomains = [
  "Agentic AI",
  "Robotics & Autonomous Systems",
  "Cybersecurity & Threat Intelligence",
  "HealthTech & MedAI",
  "FinTech & Blockchain",
  "Smart Cities & IoT",
  "Agritech & Rural Innovation",
  "Transportation & Logistics",
  "Open Innovation",
];

const Registration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    department: "",
    problemDomain: "",
  });
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; email?: string; phone: string; college: string; year: string; department: string }>>([]);
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", college: "", year: "", department: "" });
  const isValidEmail = (value: string) => /.+@.+\..+/.test(value.trim());
  const isValidPhone = (value: string) => /^\+?\d{10,15}$/.test(value.trim());
  const isValidName = (value: string) => /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(value.trim());
  const isValidYear = (value: string) => ["1", "2", "3"].includes(value.trim());
  const sanitizeName = (value: string) => value.replace(/[^A-Za-z\s.'-]/g, "");

  const handleChange = (field: string, value: string) => {
    const nextValue =
      field === "phone"
        ? value.replace(/[^\d+]/g, "")
        : field === "leaderName" || field === "teamName"
          ? sanitizeName(value)
          : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
  };

  const validateForm = () => {
    const requiredFields = [
      { key: 'teamName', label: 'Team Name', value: formData.teamName },
      { key: 'leaderName', label: 'Team Leader Name', value: formData.leaderName },
      { key: 'email', label: 'Email Address', value: formData.email },
      { key: 'phone', label: 'Phone Number', value: formData.phone },
      { key: 'college', label: 'College/University', value: formData.college },
      { key: 'year', label: 'Year of Study', value: formData.year },
      { key: 'department', label: 'Department', value: formData.department },
      { key: 'problemDomain', label: 'Problem Domain', value: formData.problemDomain },
    ];

    const missing = requiredFields.filter((field) => !field.value.trim()).map((field) => field.label);
    if (missing.length) {
      toast({
        title: "Missing information",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    if (!isValidName(formData.teamName)) {
      toast({
        title: "Invalid team name",
        description: "Team name must contain letters/spaces only.",
        variant: "destructive",
      });
      return null;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return null;
    }

    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Enter digits only, 10-15 characters.",
        variant: "destructive",
      });
      return null;
    }

    if (!isValidName(formData.leaderName)) {
      toast({
        title: "Invalid leader name",
        description: "Names should include letters/spaces only.",
        variant: "destructive",
      });
      return null;
    }

    if (!isValidYear(formData.year)) {
      toast({ title: "Invalid leader year", description: "Choose year 1, 2 or 3.", variant: "destructive" });
      return null;
    }

    const sanitizedTeamMembers = teamMembers.map((member) => ({
      name: member.name.trim(),
      email: (member.email || "").trim(),
      phone: member.phone.trim(),
      college: member.college.trim(),
      year: member.year.trim(),
      department: member.department.trim(),
    }));

    for (const member of sanitizedTeamMembers) {
      if (!isValidName(member.name)) {
        toast({ title: "Invalid member name", description: "Use letters and spaces only for member names.", variant: "destructive" });
        return null;
      }
      if (!isValidPhone(member.phone)) {
        toast({ title: "Invalid member phone", description: "Member phone should be 10-15 digits.", variant: "destructive" });
        return null;
      }
      if (!member.college) {
        toast({ title: "Missing member college", description: "Please fill college for each member.", variant: "destructive" });
        return null;
      }
      if (!isValidYear(member.year)) {
        toast({ title: "Invalid member year", description: "Choose year 1, 2 or 3.", variant: "destructive" });
        return null;
      }
    }

    const allMembers = [
      { name: formData.leaderName.trim(), email: formData.email.trim(), phone: formData.phone.trim(), college: formData.college.trim(), year: formData.year.trim(), department: formData.department.trim() },
      ...sanitizedTeamMembers,
    ];

    if (allMembers.length > 4) {
      toast({
        title: "Too many team members",
        description: "A maximum of 4 members (including leader) is allowed.",
        variant: "destructive",
      });
      return null;
    }

    if (allMembers.length < 1) {
      toast({
        title: "Add at least one member",
        description: "Team must have at least the leader.",
        variant: "destructive",
      });
      return null;
    }

    const invalidMemberEmails = allMembers.filter((member) => member.email && !isValidEmail(member.email));
    if (invalidMemberEmails.length) {
      toast({
        title: "Invalid member email",
        description: "Please check the email addresses for all team members.",
        variant: "destructive",
      });
      return null;
    }

    return allMembers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const allMembers = validateForm();
    if (!allMembers) return;

    setIsSubmitting(true);

    try {
      const result = await addRegistration({
        teamName: formData.teamName,
        leaderName: formData.leaderName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        year: formData.year,
        department: formData.department,
        members: allMembers,
        problemStatement: formData.problemDomain,
        problemDomain: formData.problemDomain,
        submittedAt: new Date(),
      });

      if (!result.success) {
        throw new Error(result.error || 'Unable to submit registration');
      }

      setSubmitted(true);
      setFormData({ teamName: "", leaderName: "", email: "", phone: "", college: "", year: "", department: "", problemDomain: "" });
      setTeamMembers([]);
      setNewMember({ name: "", email: "", phone: "", college: "", year: "", department: "" });
      toast({
        title: "Registration Successful!",
        description: "Redirecting to payment page...",
      });

      // Redirect to payment page with registration ID
      setTimeout(() => {
        navigate('/payment', { state: { registrationId: result.id } });
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Register Your <span className="text-gradient">Team</span>
          </h2>
          <p className="section-subtitle">
            Ready to take on the challenge? Register your team now and be part of Zayathon 2026!
            Open for students up to 3rd year.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {!submitted ? (
            <div className="glow-card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-foreground">
                      Team Name *
                    </Label>
                    <Input
                      id="teamName"
                      placeholder="Enter your team name"
                      required
                      value={formData.teamName}
                      onChange={(e) => handleChange("teamName", e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="text-foreground">
                      Team Leader Name *
                    </Label>
                    <Input
                      id="leaderName"
                      placeholder="Enter team leader name"
                      required
                      value={formData.leaderName}
                      onChange={(e) => handleChange("leaderName", e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-foreground">
                      College/University *
                    </Label>
                    <Input
                      id="college"
                      placeholder="Enter your college name"
                      required
                      value={formData.college}
                      onChange={(e) => handleChange("college", sanitizeName(e.target.value))}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-foreground">
                      Year of Study *
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => handleChange("year", value)}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-foreground">
                    Department *
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="AIML">AIML</SelectItem>
                      <SelectItem value="CSD">CSD</SelectItem>
                      <SelectItem value="CSBE">CSBE</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="BME">BME</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="CIVIL">CIVIL</SelectItem>
                      <SelectItem value="AIDS">AIDS</SelectItem>
                      <SelectItem value="MEC">MEC</SelectItem>
                      <SelectItem value="MECH">MECH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Problem Domain Selection */}
                <div className="space-y-2">
                  <Label htmlFor="problemDomain" className="text-foreground">
                    Problem Domain *
                  </Label>
                  <Select
                    value={formData.problemDomain}
                    onValueChange={(value) => handleChange("problemDomain", value)}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select problem domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {problemDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Add Team Members (optional)</p>
                      <p className="text-xs text-muted-foreground">Max 3 additional members; leader already counted.</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{teamMembers.length} / 3</span>
                  </div>

                  {teamMembers.length > 0 && (
                    <div className="space-y-2">
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                          <div className="text-sm text-foreground">
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-muted-foreground">{member.phone} • {member.college} • Year {member.year} • {member.department}</p>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-destructive"
                            onClick={() => setTeamMembers((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {teamMembers.length < 3 && (
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-foreground">Member Name</Label>
                          <Input
                            placeholder="Enter full name"
                            value={newMember.name}
                            onChange={(e) => setNewMember((prev) => ({ ...prev, name: sanitizeName(e.target.value) }))}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Email (optional)</Label>
                          <Input
                            placeholder="member@email.com"
                            value={newMember.email}
                            onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Phone</Label>
                          <Input
                            placeholder="10 digit number"
                            value={newMember.phone}
                            onChange={(e) => setNewMember((prev) => ({ ...prev, phone: e.target.value.replace(/[^\d+]/g, "") }))}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">College</Label>
                          <Input
                            placeholder="College/University"
                            value={newMember.college}
                            onChange={(e) => setNewMember((prev) => ({ ...prev, college: sanitizeName(e.target.value) }))}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Year</Label>
                          <Select value={newMember.year} onValueChange={(value) => setNewMember((prev) => ({ ...prev, year: value }))}>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Department</Label>
                          <Select value={newMember.department} onValueChange={(value) => setNewMember((prev) => ({ ...prev, department: value }))}>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CSE">CSE</SelectItem>
                              <SelectItem value="AIML">AIML</SelectItem>
                              <SelectItem value="CSD">CSD</SelectItem>
                              <SelectItem value="CSBE">CSBE</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="ECE">ECE</SelectItem>
                              <SelectItem value="BME">BME</SelectItem>
                              <SelectItem value="EEE">EEE</SelectItem>
                              <SelectItem value="CIVIL">CIVIL</SelectItem>
                              <SelectItem value="AIDS">AIDS</SelectItem>
                              <SelectItem value="MEC">MEC</SelectItem>
                              <SelectItem value="MECH">MECH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        onClick={() => {
                          if (teamMembers.length >= 3) return;
                          const candidate = {
                            name: newMember.name.trim(),
                            email: newMember.email.trim(),
                            phone: newMember.phone.trim(),
                            college: newMember.college.trim(),
                            year: newMember.year.trim(),
                            department: newMember.department.trim(),
                          };

                          if (!candidate.name || !candidate.phone || !candidate.college || !candidate.year || !candidate.department) {
                            toast({ title: "Complete member fields", description: "Fill name, phone, college, year, and department before adding.", variant: "destructive" });
                            return;
                          }
                          if (!isValidName(candidate.name)) {
                            toast({ title: "Invalid member name", description: "Use letters and spaces only.", variant: "destructive" });
                            return;
                          }
                          if (!isValidPhone(candidate.phone)) {
                            toast({ title: "Invalid member phone", description: "Phone should be 10-15 digits.", variant: "destructive" });
                            return;
                          }
                          if (!isValidYear(candidate.year)) {
                            toast({ title: "Invalid member year", description: "Choose year 1, 2 or 3.", variant: "destructive" });
                            return;
                          }
                          if (candidate.email && !isValidEmail(candidate.email)) {
                            toast({ title: "Invalid member email", description: "Use a valid email or leave it blank.", variant: "destructive" });
                            return;
                          }

                          setTeamMembers((prev) => [...prev, candidate]);
                          setNewMember({ name: "", email: "", phone: "", college: "", year: "", department: "" });
                        }}
                      >
                        Add Member
                      </button>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full neon-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </motion.button>
              </form>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glow-card p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Registration Successful!
              </h3>
              <p className="text-muted-foreground mb-6">
                Thank you for registering for Zayathon 2026. We'll send you a confirmation
                email with further details about team selection and problem statements.
              </p>
              <motion.button
                onClick={() => setSubmitted(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="neon-button-secondary text-sm py-3 px-6"
              >
                Register Another Team
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Registration;
