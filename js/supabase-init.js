// Supabase Configuration
// Update these with your Supabase project details
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Schema (SQL to run in Supabase):
/*
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  personal_email TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Student', 'Parent', 'Staff')),
  password_hash TEXT,
  setup_token TEXT,
  setup_token_expiry TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL CHECK (staff_role IN ('Tutor', 'Admission Officer', 'Accountant', 'SuperAdmin', 'Admin Officer', 'LLM Officer')),
  permissions JSONB DEFAULT '{}',
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_onboarding_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  personal_email TEXT,
  email_status TEXT NOT NULL CHECK (email_status IN ('pending', 'created', 'suspended', 'quarantine')),
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "SuperAdmin can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM staff_roles WHERE staff_role = 'SuperAdmin'
    )
  );

CREATE POLICY "Admin can view onboarding logs" ON user_onboarding_log
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM staff_roles WHERE staff_role IN ('SuperAdmin', 'Admin Officer')
    )
  );
*/

// Utility functions
async function supabaseSignUp(email, password, name, role, personalEmail) {
  try {
    // Sign up user
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // Create user record
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        personal_email: personalEmail,
        name,
        role
      }])
      .select();

    if (userError) throw userError;

    // Create onboarding log
    if (personalEmail) {
      await supabaseClient
        .from('user_onboarding_log')
        .insert([{
          user_id: authData.user.id,
          personal_email: personalEmail,
          email_status: 'pending'
        }]);
    }

    return { success: true, user: userData[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function assignStaffRole(userId, staffRole, permissions = {}) {
  try {
    const adminId = (await supabaseClient.auth.getUser()).data.user.id;

    const { data, error } = await supabaseClient
      .from('staff_roles')
      .insert([{
        user_id: userId,
        staff_role: staffRole,
        permissions,
        assigned_by: adminId
      }])
      .select();

    if (error) throw error;

    // Log the action
    await logAuditAction(
      'Assigned',
      'Staff Role',
      `Assigned ${staffRole} to user ${userId}`
    );

    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateEmailStatus(userId, emailStatus, notes = '') {
  try {
    const adminId = (await supabaseClient.auth.getUser()).data.user.id;

    const { data, error } = await supabaseClient
      .from('user_onboarding_log')
      .update({
        email_status: emailStatus,
        notes,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    // Log the action
    await logAuditAction(
      'Updated',
      'Email Status',
      `Changed status to ${emailStatus} for user ${userId}`
    );

    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getOnboardingLog() {
  try {
    const { data, error } = await supabaseClient
      .from('user_onboarding_log')
      .select(`
        *,
        user:user_id(name, email, personal_email),
        updated_by_user:updated_by(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logAuditAction(action, resource, details) {
  try {
    const { data: user } = await supabaseClient.auth.getUser();
    if (!user) return;

    await supabaseClient
      .from('audit_logs')
      .insert([{
        admin_id: user.user.id,
        action,
        resource,
        details
      }]);
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

async function getStaffPermissions(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('staff_roles')
      .select('staff_role, permissions')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching staff permissions:', error);
    return null;
  }
}

async function isSuperAdmin(userId) {
  try {
    const staffRole = await getStaffPermissions(userId);
    return staffRole?.staff_role === 'SuperAdmin';
  } catch (error) {
    return false;
  }
}
