import { createClient } from '@supabase/supabase-js';

export async function auth(req,res,next){
  const token = req.headers.authorization?.replace(/^Bearer\s+/i,'');
  const configured = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
  if (!configured) {
    if (process.env.DEMO_MODE === 'true') { req.user={id:'00000000-0000-0000-0000-000000000001',email:'demo@local'}; return next(); }
    return res.status(503).json({error:'Supabase authentication is not configured.'});
  }
  if (!token) return res.status(401).json({error:'Authentication required.'});
  const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await supabase.auth.getUser(token);
  if (error || !data.user || !data.user.email_confirmed_at) return res.status(401).json({error:'Please verify your email before using the application.'});
  req.user=data.user; req.supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}}); next();
}
