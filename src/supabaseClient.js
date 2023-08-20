import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ivxjpsvecvekelldyaul.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eGpwc3ZlY3Zla2VsbGR5YXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzOTQxNjQsImV4cCI6MjAwNzk3MDE2NH0.X0tUQ4vpW1uYms6Een4De8A0hpbSV48BnPk8Diaez2A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
