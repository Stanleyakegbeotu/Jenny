import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function SupabaseWarning() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return null; // Hide if configured
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="ml-2 text-yellow-800 dark:text-yellow-200">
        ⚠️ Supabase not configured. Forms won't save data. 
        <br />
        Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to{' '}
        <code className="font-mono">.env.local</code>
      </AlertDescription>
    </Alert>
  );
}
