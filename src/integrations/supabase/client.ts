import { createClient } from '@supabase/supabase-js';

// Get environment variables - ensure they're strings
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const supabaseEdgeFunctionsUrl = `${supabaseUrl}/functions/v1`;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email sending function using Vercel API route with Resend
export const sendEmail = async (options: {
  type: 'single' | 'broadcast';
  email?: string;
  subject: string;
  html: string;
  from?: string;
}) => {
  try {
    // Use the Vercel API route for email sending
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    const response = await fetch(`${apiUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Function to add a new registration
export const addRegistration = async (registrationData: {
  teamName: string;
  leaderName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  department: string;
  members: Array<{ name: string; email?: string; phone?: string; college?: string; year?: string; department?: string }>;
  problemStatement?: string;
  problemDomain?: string;
  submittedAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
  experienceLevel?: string;
  paymentScreenshot?: string;
}) => {
  if (!isConfigured) {
    return { success: false, error: 'Supabase configuration missing' };
  }

  try {
    const sanitizedMembers = registrationData.members.map((member) => ({
      name: member.name.trim(),
      email: (member.email || '').trim(),
      phone: (member.phone || '').trim(),
      college: (member.college || '').trim(),
      year: (member.year || '').trim(),
      department: (member.department || '').trim(),
    }));

    // Map the data to match the Supabase schema
    const dbData = {
      team_name: registrationData.teamName.trim(),
      team_members: sanitizedMembers,
      contact_email: registrationData.email.trim(),
      contact_phone: registrationData.phone.trim(),
      institution: registrationData.college.trim(),
      year_of_study: registrationData.year.trim(),
      department: registrationData.department.trim(),
      problem_statement: (registrationData.problemStatement || 'Not specified').trim(),
      problem_domain: (registrationData.problemDomain || '').trim(),
      experience_level: (registrationData.experienceLevel || 'beginner').trim(),
      status: registrationData.status || 'pending',
      payment_screenshot: registrationData.paymentScreenshot || null,
      created_at: (registrationData.submittedAt || new Date()).toISOString(),
    };

    const { data, error } = await supabase
      .from('registrations')
      .insert([dbData])
      .select();

    if (error) {
      return { success: false, error: error.message, details: error };
    }

    return { success: true, id: data?.[0]?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Function to get all registrations (for admin)
export const getRegistrations = async () => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Function to get registration count
export const getRegistrationCount = async () => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting registrations:', error);
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count };
  } catch (error: any) {
    console.error('Error counting registrations:', error);
    return { success: false, error: error.message, count: 0 };
  }
};
