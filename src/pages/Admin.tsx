import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRegistrations, getRegistrationCount, sendEmail, supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Users, Download, RefreshCw, Search, LogOut, Check, X,
  Trophy, Mail, BarChart3, Plus, Edit, Trash2, Send, Image
} from 'lucide-react';

interface Registration {
  id: string;
  team_name: string;
  team_members: Array<{ name: string; email: string; phone?: string; college?: string; year?: string; department?: string }>;
  contact_email: string;
  contact_phone: string;
  institution: string;
  year_of_study: string;
  department: string;
  problem_statement: string;
  problem_domain: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_screenshot?: string;
  created_at: string;
}

interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  is_active: boolean;
}

interface Winner {
  id: string;
  registration_id: string;
  team_name: string;
  rank: number;
  prize: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('registrations');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Problem Statements State
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [showAddProblemDialog, setShowAddProblemDialog] = useState(false);
  const [newProblem, setNewProblem] = useState({ title: '', description: '', category: '', difficulty: 'medium' });

  // Winners State
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showAddWinnerDialog, setShowAddWinnerDialog] = useState(false);
  const [selectedWinnerRegistration, setSelectedWinnerRegistration] = useState<string>('');
  const [winnerRank, setWinnerRank] = useState<'1' | '2' | '3'>('1');
  const [winnerPrize, setWinnerPrize] = useState('');

  // Email Dialog State
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Team Details Dialog State
  const [showTeamDetailsDialog, setShowTeamDetailsDialog] = useState(false);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<Registration | null>(null);

  // Email templates
  const templates = {
    selected: {
      subject: 'Congratulations! You are selected for Zayathon 2025',
      body: `<h2>🎉 Congratulations!</h2>
<p>Dear Team,</p>
<p>We are pleased to inform you that your team has been <strong>SELECTED</strong> for Zayathon 2025!</p>
<p>Get ready for an amazing hackathon experience. We will share more details soon.</p>
<p>Best regards,<br>Zayathon Team</p>`
    },
    rejected: {
      subject: 'Update on your Zayathon 2025 application',
      body: `<h2>Thank you for applying</h2>
<p>Dear Team,</p>
<p>Thank you for your interest in Zayathon 2025.</p>
<p>After careful review, we regret to inform you that your team was not <strong>SELECTED</strong> this time.</p>
<p>We encourage you to participate in future events.</p>
<p>Best regards,<br>Zayathon Team</p>`
    }
  };
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState({
    team_name: '',
    contact_email: '',
    contact_phone: '',
    institution: '',
    year_of_study: '',
    department: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    problem_statement: '',
    problem_domain: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for registrations
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Registration change detected:', payload);
          // Refresh registrations when any change occurs
          fetchRegistrations();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    // Development bypass - remove this in production
    const isDev = import.meta.env.DEV;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !isDev) {
      navigate('/login');
      return;
    }
    setUser(user);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRegistrations(),
        fetchProblemStatements(),
        fetchWinners()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations...');
      const result = await getRegistrations();
      console.log('Fetch result:', result);
      
      if (result.success && result.data) {
        // Add status and problem_statement fields if they don't exist
        // Also ensure team_members is properly parsed as JSON
        const regs = result.data.map((r: any) => {
          let teamMembers = r.team_members;
          // Parse team_members if it's a string (JSON serialization issue)
          if (typeof teamMembers === 'string') {
            try {
              teamMembers = JSON.parse(teamMembers);
            } catch (e) {
              console.error('Error parsing team_members:', e);
              teamMembers = [];
            }
          }
          return {
            ...r,
            team_members: teamMembers,
            status: r.status || 'pending',
            problem_statement: r.problem_statement || 'Not specified',
            payment_screenshot: r.payment_screenshot || null
          };
        });
        console.log('Processed registrations:', regs);
        setRegistrations(regs as Registration[]);
      } else {
        console.error('Failed to fetch registrations:', result.error);
      }
      
      const countResult = await getRegistrationCount();
      if (countResult.success) {
        setTotalCount(countResult.count || 0);
      }
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
    }
  };

  const fetchProblemStatements = async () => {
    const { data } = await supabase.from('problem_statements').select('*').order('created_at', { ascending: false });
    if (data) {
      setProblemStatements(data);
    }
  };

  const fetchWinners = async () => {
    const { data } = await supabase.from('results').select('*').order('rank', { ascending: true });
    if (data) {
      setWinners(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleApproveRegistration = async (id: string) => {
    if (processingIds.has(id)) return;
    
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      console.log('Attempting to approve registration:', id);
      
      // Optimistically update the UI
      setRegistrations(prev => 
        prev.map(reg => reg.id === id ? { ...reg, status: 'approved' as const } : reg)
      );

      // Try direct update with explicit RLS bypass using service role would be ideal
      // But since we're using anon key, we need to ensure policies allow it
      const { data, error } = await supabase
        .from('registrations')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error approving registration:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Check if it's an RLS policy error
        if (error.message?.includes('policy') || error.code === '42501') {
          toast({ 
            title: 'Permission Error', 
            description: 'Row Level Security is blocking this operation. Please add UPDATE policy in Supabase Dashboard.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error', 
            description: error.message || 'Failed to approve registration', 
            variant: 'destructive' 
          });
        }
        
        // Revert optimistic update
        await fetchRegistrations();
      } else {
        console.log('Approval successful:', data);
        toast({ title: 'Success', description: 'Registration approved!' });
        // Fetch fresh data to ensure consistency
        await fetchRegistrations();
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      await fetchRegistrations();
      toast({ 
        title: 'Error', 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRejectRegistration = async (id: string) => {
    if (processingIds.has(id)) return;
    
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      console.log('Attempting to reject registration:', id);
      
      // Optimistically update the UI
      setRegistrations(prev => 
        prev.map(reg => reg.id === id ? { ...reg, status: 'rejected' as const } : reg)
      );

      const { data, error } = await supabase
        .from('registrations')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error rejecting registration:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Check if it's an RLS policy error
        if (error.message?.includes('policy') || error.code === '42501') {
          toast({ 
            title: 'Permission Error', 
            description: 'Row Level Security is blocking this operation. Please add UPDATE policy in Supabase Dashboard.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error', 
            description: error.message || 'Failed to reject registration', 
            variant: 'destructive' 
          });
        }
        
        // Revert optimistic update
        await fetchRegistrations();
      } else {
        console.log('Rejection successful:', data);
        toast({ title: 'Success', description: 'Registration rejected!' });
        // Fetch fresh data to ensure consistency
        await fetchRegistrations();
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      await fetchRegistrations();
      toast({ 
        title: 'Error', 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditRegistration = (reg: Registration) => {
    setEditingReg(reg);
    setEditForm({
      team_name: reg.team_name,
      contact_email: reg.contact_email,
      contact_phone: reg.contact_phone,
      institution: reg.institution,
      year_of_study: reg.year_of_study,
      department: reg.department || '',
      status: reg.status,
      problem_statement: reg.problem_statement,
      problem_domain: reg.problem_domain || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReg) return;
    
    const { error } = await supabase
      .from('registrations')
      .update({
        team_name: editForm.team_name,
        contact_email: editForm.contact_email,
        contact_phone: editForm.contact_phone,
        institution: editForm.institution,
        year_of_study: editForm.year_of_study,
        department: editForm.department,
        status: editForm.status,
        problem_statement: editForm.problem_statement
      })
      .eq('id', editingReg.id);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to update registration', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Registration updated!' });
      setShowEditDialog(false);
      setEditingReg(null);
      fetchRegistrations();
    }
  };

  const handleAddProblemStatement = async () => {
    const { error } = await supabase.from('problem_statements').insert([{
      title: newProblem.title,
      description: newProblem.description,
      category: newProblem.category,
      difficulty: newProblem.difficulty,
      is_active: true
    }]);
    if (error) {
      toast({ title: 'Error', description: 'Failed to add problem statement', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Problem statement added!' });
      setShowAddProblemDialog(false);
      setNewProblem({ title: '', description: '', category: '', difficulty: 'medium' });
      fetchProblemStatements();
    }
  };

  const handleDeleteProblemStatement = async (id: string) => {
    const { error } = await supabase.from('problem_statements').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete problem statement', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Problem statement deleted!' });
      fetchProblemStatements();
    }
  };

  const handleToggleProblemStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('problem_statements').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      fetchProblemStatements();
    }
  };

  const handleAddWinner = async () => {
    const selectedReg = registrations.find(r => r.id === selectedWinnerRegistration);
    const { error } = await supabase.from('results').insert([{
      registration_id: selectedWinnerRegistration,
      rank: parseInt(winnerRank),
      prize: winnerPrize
    }]);
    if (error) {
      toast({ title: 'Error', description: 'Failed to add winner', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Winner added: ${selectedReg?.team_name}` });
      setShowAddWinnerDialog(false);
      setSelectedWinnerRegistration('');
      setWinnerRank('1');
      setWinnerPrize('');
      fetchWinners();
    }
  };

  const handleDeleteWinner = async (id: string) => {
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete winner', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Winner removed!' });
      fetchWinners();
    }
  };

  const handleSendEmail = async (email: string) => {
    setSelectedEmail(email);
    setEmailSubject('');
    setEmailBody('');
    setShowEmailDialog(true);
  };

  const handleViewTeamDetails = (reg: Registration) => {
    setSelectedTeamDetails(reg);
    setShowTeamDetailsDialog(true);
  };

  const handleSendSingleEmail = async () => {
    if (!selectedEmail || !emailSubject) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    
    setSendingEmail(true);
    try {
      const result = await sendEmail({
        type: 'single',
        email: selectedEmail,
        subject: emailSubject,
        html: emailBody,
      });
      
      if (result.success) {
        toast({ title: 'Success', description: `Email sent to ${selectedEmail}` });
        setShowEmailDialog(false);
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to send email', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleBroadcastEmail = async () => {
    setEmailSubject('');
    setEmailBody('');
    setShowEmailDialog(true);
  };

  const handleSendBroadcastEmail = async () => {
    if (!emailSubject) {
      toast({ title: 'Error', description: 'Please enter a subject', variant: 'destructive' });
      return;
    }
    
    setSendingEmail(true);
    try {
      const result = await sendEmail({
        type: 'broadcast',
        subject: emailSubject,
        html: emailBody,
      });
      
      if (result.success) {
        toast({ title: 'Success', description: 'Broadcast email sent to all participants' });
        setShowEmailDialog(false);
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to send broadcast email', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Team Name', 'Leader Name', 'Email', 'Phone', 'College', 'Year', 'Department', 'Problem Statement', 'Status', 'Payment Status', 'Created At'];
    const rows = registrations.map((reg) => [
      reg.team_name,
      reg.team_members?.[0]?.name || '',
      reg.contact_email,
      reg.contact_phone,
      reg.institution,
      reg.year_of_study,
      reg.department || '',
      reg.problem_statement,
      reg.status,
      reg.payment_screenshot ? 'Paid' : 'Pending',
      reg.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reg.team_name?.toLowerCase().includes(searchLower) ||
      reg.contact_email?.toLowerCase().includes(searchLower) ||
      reg.institution?.toLowerCase().includes(searchLower)
    );
  });

  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;
  const paidCount = registrations.filter(r => r.payment_screenshot).length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your hackathon</p>
          </div>
          <div className="flex gap-4 items-center">
            <Button onClick={fetchRegistrations} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-500">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{paidCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="registrations"><Users className="w-4 h-4 mr-2" />Registrations</TabsTrigger>
            <TabsTrigger value="problems"><Edit className="w-4 h-4 mr-2" />Problems</TabsTrigger>
            <TabsTrigger value="winners"><Trophy className="w-4 h-4 mr-2" />Winners</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Registrations</CardTitle>
                  <CardDescription>Manage team registrations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBroadcastEmail} variant="outline">
                    <Mail className="w-4 h-4 mr-2" />Broadcast
                  </Button>
                  <Button onClick={exportToCSV} variant="default">
                    <Download className="w-4 h-4 mr-2" />Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label htmlFor="search" className="sr-only">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by team name, email, college..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No registrations found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRegistrations.map((reg) => (
                      <div key={reg.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{reg.team_name}</h3>
                              <Badge variant={
                                reg.status === 'approved' ? 'default' :
                                reg.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {reg.status}
                              </Badge>
                              {reg.payment_screenshot ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/50">
                                  <Image className="w-3 h-3 mr-1" />
                                  Payment Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/50">
                                  Payment Pending
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium">Leader:</span> {reg.team_members?.[0]?.name || '-'}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span> {reg.contact_email}
                              </p>
                              <p>
                                <span className="font-medium">College:</span> {reg.institution}
                              </p>
                              <p>
                                <span className="font-medium">Phone:</span> {reg.contact_phone || '-'}
                              </p>
                              <p>
                                <span className="font-medium">Team Members:</span>{" "}
                                {reg.team_members?.map((member, index) => (
                                  <span key={index} className="inline-flex items-center">
                                    {member.name}
                                    {index < (reg.team_members?.length || 0) - 1 && ", "} 
                                  </span>
                                )) || '-'}
                              </p>
                              <p>
                                <span className="font-medium">Year:</span> {reg.year_of_study || '-'}
                              </p>
                              <p>
                                <span className="font-medium">Department:</span> {reg.department || '-'}
                              </p>
                              <p>
                                <span className="font-medium">Problem Domain:</span> {reg.problem_domain || '-'}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Problem Statement:</span> {reg.problem_statement}
                            </p>
                            {reg.payment_screenshot && (
                              <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-green-600">Payment Screenshot Uploaded</span>
                                  <a 
                                    href={reg.payment_screenshot} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline font-medium flex items-center gap-1"
                                  >
                                    <Image className="w-4 h-4" />
                                    View Screenshot
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 md:min-w-[140px]">
                            {reg.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveRegistration(reg.id)} 
                                  className="bg-green-500 hover:bg-green-600 w-full"
                                  disabled={processingIds.has(reg.id)}
                                >
                                  {processingIds.has(reg.id) ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />Approve
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleRejectRegistration(reg.id)}
                                  className="w-full"
                                  disabled={processingIds.has(reg.id)}
                                >
                                  {processingIds.has(reg.id) ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-4 h-4 mr-1" />Reject
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {reg.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleRejectRegistration(reg.id)}
                                className="w-full"
                                disabled={processingIds.has(reg.id)}
                              >
                                {processingIds.has(reg.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-1" />Revoke
                                  </>
                                )}
                              </Button>
                            )}
                            {reg.status === 'rejected' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveRegistration(reg.id)} 
                                className="bg-green-500 hover:bg-green-600 w-full"
                                disabled={processingIds.has(reg.id)}
                              >
                                {processingIds.has(reg.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />Approve
                                  </>
                                )}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewTeamDetails(reg)}
                              className="w-full"
                            >
                              <Users className="w-4 h-4 mr-1" />Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditRegistration(reg)}
                              className="w-full"
                              disabled={processingIds.has(reg.id)}
                            >
                              <Edit className="w-4 h-4 mr-1" />Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleSendEmail(reg.contact_email)}
                              className="w-full"
                            >
                              <Mail className="w-4 h-4 mr-1" />Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Problem Statements Tab */}
          <TabsContent value="problems">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Problem Statements</CardTitle>
                  <CardDescription>Manage hackathon challenges</CardDescription>
                </div>
                <Button onClick={() => setShowAddProblemDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />Add Problem
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {problemStatements.map((problem) => (
                    <div key={problem.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{problem.title}</h3>
                            <Badge variant={problem.is_active ? 'default' : 'secondary'}>
                              {problem.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{problem.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{problem.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Category:</span> {problem.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggleProblemStatus(problem.id, problem.is_active)}>
                            {problem.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProblemStatement(problem.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {problemStatements.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No problem statements yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Winners</CardTitle>
                  <CardDescription>Manage hackathon results</CardDescription>
                </div>
                <Button onClick={() => setShowAddWinnerDialog(true)}>
                  <Trophy className="w-4 h-4 mr-2" />Add Winner
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {winners.map((winner) => {
                    const reg = registrations.find(r => r.id === winner.registration_id);
                    return (
                      <div key={winner.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                              ${winner.rank === 1 ? 'bg-yellow-500 text-white' :
                                winner.rank === 2 ? 'bg-gray-400 text-white' :
                                'bg-orange-600 text-white'}`}>
                              {winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{reg?.team_name || 'Unknown Team'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {winner.rank === 1 ? 'First Place' : winner.rank === 2 ? 'Second Place' : 'Third Place'}
                                {winner.prize && ` • ${winner.prize}`}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteWinner(winner.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {winners.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No winners announced yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registrations by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Approved</span>
                      <span className="font-bold text-green-500">{approvedCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalCount ? (approvedCount/totalCount)*100 : 0}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-yellow-500">{pendingCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalCount ? (pendingCount/totalCount)*100 : 0}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rejected</span>
                      <span className="font-bold text-red-500">{rejectedCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalCount ? (rejectedCount/totalCount)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Total Registrations</span>
                      <span className="font-bold text-2xl">{totalCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Total Teams</span>
                      <span className="font-bold text-2xl">{registrations.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Active Problems</span>
                      <span className="font-bold text-2xl">{problemStatements.filter(p => p.is_active).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Announced Winners</span>
                      <span className="font-bold text-2xl">{winners.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Problem Dialog */}
      <Dialog open={showAddProblemDialog} onOpenChange={setShowAddProblemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Problem Statement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newProblem.title} onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })} placeholder="Problem title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newProblem.description} onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })} placeholder="Problem description" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={newProblem.category} onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })} placeholder="e.g., AI, Blockchain, etc." />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <select
                className="w-full p-2 border rounded"
                value={newProblem.difficulty}
                onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProblemDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProblemStatement}>Add Problem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Winner Dialog */}
      <Dialog open={showAddWinnerDialog} onOpenChange={setShowAddWinnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Winner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Team</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedWinnerRegistration}
                onChange={(e) => setSelectedWinnerRegistration(e.target.value)}
              >
                <option value="">Select a team...</option>
                {registrations.filter(r => r.status === 'approved').map((reg) => (
                  <option key={reg.id} value={reg.id}>{reg.team_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rank</Label>
              <select
                className="w-full p-2 border rounded"
                value={winnerRank}
                onChange={(e) => setWinnerRank(e.target.value as '1' | '2' | '3')}
              >
                <option value="1">🥇 First Place</option>
                <option value="2">🥈 Second Place</option>
                <option value="3">🥉 Third Place</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prize</Label>
              <Input value={winnerPrize} onChange={(e) => setWinnerPrize(e.target.value)} placeholder="e.g., ₹10,000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWinnerDialog(false)}>Cancel</Button>
            <Button onClick={handleAddWinner} disabled={!selectedWinnerRegistration}>Add Winner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input value={editForm.team_name} onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.contact_email} onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.contact_phone} onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>College</Label>
              <Input value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <select
                className="w-full p-2 border rounded"
                value={editForm.year_of_study}
                onChange={(e) => setEditForm({ ...editForm, year_of_study: e.target.value })}
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                className="w-full p-2 border rounded"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              >
                <option value="">Select department</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="CSD">CSD</option>
                <option value="CSBE">CSBE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="BME">BME</option>
                <option value="EEE">EEE</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AIDS">AIDS</option>
                <option value="MEC">MEC</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Problem Statement</Label>
              <Input value={editForm.problem_statement} onChange={(e) => setEditForm({ ...editForm, problem_statement: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Details Dialog */}
      <Dialog open={showTeamDetailsDialog} onOpenChange={setShowTeamDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Details - {selectedTeamDetails?.team_name}
            </DialogTitle>
            <DialogDescription>
              Complete team information including all team members
            </DialogDescription>
          </DialogHeader>
          {selectedTeamDetails && (
            <div className="space-y-6">
              {/* Team Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Team Name</p>
                  <p className="font-semibold">{selectedTeamDetails.team_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Problem Domain</p>
                  <p className="font-semibold">{selectedTeamDetails.problem_domain || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedTeamDetails.status === 'approved' ? 'default' :
                    selectedTeamDetails.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedTeamDetails.status}
                  </Badge>
                </div>
              </div>

              {/* Team Members Section */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members ({selectedTeamDetails.team_members?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedTeamDetails.team_members?.map((member, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-lg">{member.name}</span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">Team Leader</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span>{member.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{member.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">College:</span>
                          <span>{member.college || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Year:</span>
                          <span>{member.year ? `${member.year} Year` : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <span className="text-muted-foreground">Department:</span>
                          <span>{member.department || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!selectedTeamDetails.team_members?.length && (
                    <p className="text-muted-foreground text-center py-4">No team members found</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{selectedTeamDetails.contact_email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{selectedTeamDetails.contact_phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEmail ? `Send Email to ${selectedEmail}` : 'Broadcast Email to All Participants'}</DialogTitle>
            <DialogDescription>
              {selectedEmail 
                ? `Send a personalized email to this participant`
                : `This will send an email to all ${registrations.length} registered participants`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quick Templates */}
            {selectedEmail && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => {
                    setEmailSubject(templates.selected.subject);
                    setEmailBody(templates.selected.body);
                  }}
                >
                  ✓ Selected
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => {
                    setEmailSubject(templates.rejected.subject);
                    setEmailBody(templates.rejected.body);
                  }}
                >
                  ✗ Rejected
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input 
                id="subject" 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message (HTML supported)</Label>
              <textarea
                id="body"
                className="w-full p-2 border rounded min-h-[150px] resize-y text-foreground bg-input"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="<p>Your message here...</p>"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={sendingEmail}>Cancel</Button>
            <Button 
              onClick={selectedEmail ? handleSendSingleEmail : handleSendBroadcastEmail} 
              disabled={!emailSubject || sendingEmail}
            >
              {sendingEmail ? 'Sending...' : selectedEmail ? 'Send Email' : 'Send Broadcast'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
