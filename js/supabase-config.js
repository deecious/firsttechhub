// Supabase Configuration
// IMPORTANT: Never commit real credentials to git
// Create a .env file locally (not committed) with your Supabase credentials
// Copy .env.example to .env and fill in your values

// Load from environment if available, otherwise use placeholders
const supabaseConfig = {
  url: process.env?.SUPABASE_URL || "YOUR_SUPABASE_URL",
  anonKey: process.env?.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
};

// Initialize Supabase Client
let supabase = null;

try {
  // Create a simple Supabase client using the REST API
  // For a real implementation, include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
  
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.log('Supabase initialized successfully');
  } else {
    console.warn('Supabase client not loaded. Include Supabase CDN script in HTML.');
  }
} catch (error) {
  console.warn('Supabase initialization failed:', error);
  console.warn('Using localStorage fallback for development');
}

// Supabase Helper Functions (compatible with existing code)
async function addDocument(table, data) {
  if (!supabase) return null;
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return result?.[0]?.id || null;
  } catch (error) {
    console.error(`Error adding to ${table}:`, error);
    return null;
  }
}

async function getDocuments(table) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
}

async function updateDocument(table, docId, data) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from(table)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', docId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    return false;
  }
}

async function deleteDocument(table, docId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', docId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    return false;
  }
}

async function queryDocuments(table, field, operator, value) {
  if (!supabase) return [];
  try {
    let query = supabase.from(table).select('*');
    
    // Map operators for Supabase
    switch(operator) {
      case '==':
        query = query.eq(field, value);
        break;
      case '<':
        query = query.lt(field, value);
        break;
      case '>':
        query = query.gt(field, value);
        break;
      case '<=':
        query = query.lte(field, value);
        break;
      case '>=':
        query = query.gte(field, value);
        break;
      case '!=':
        query = query.neq(field, value);
        break;
      default:
        query = query.eq(field, value);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error querying ${table}:`, error);
    return [];
  }
}

// Convenience functions
async function getUserByEmail(email) {
  return queryDocuments('users', 'email', '==', email);
}

async function getClassesByInstructor(instructorId) {
  return queryDocuments('classes', 'instructor_id', '==', instructorId);
}

async function getEnrollmentsByStudent(studentId) {
  return queryDocuments('enrollments', 'student_id', '==', studentId);
}

async function getTasksByAssignee(assigneeId) {
  return queryDocuments('tasks', 'assignee_id', '==', assigneeId);
}

async function getAssignmentsByClass(classId) {
  return queryDocuments('assignments', 'class_id', '==', classId);
}
