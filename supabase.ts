
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anmhlzwmcmqvhzvgaosz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWhsendtY21xdmh6dmdhb3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mzk1MjIsImV4cCI6MjA4NjIxNTUyMn0.8V1t5Ol2LAvJNugwliZ6f_3CyjsGKmGd3HN3E7_YO9g';

export const supabase = createClient(supabaseUrl, supabaseKey);
