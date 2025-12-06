import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pljwugegigzryisusgqa.supabase.co";
const supabaseKey = "sb_publishable_kj6CLhi10t4wX7xhSb3V9w_TDnWYHrO";

export const supabase = createClient(supabaseUrl, supabaseKey);
