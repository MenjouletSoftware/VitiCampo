import { supabase } from './supabase';

export async function signUpWithEmail(email: string, password: string) {
  const resp = await supabase.auth.signUp({ email, password });
  return resp;
}

export async function signInWithEmail(email: string, password: string) {
  const resp = await supabase.auth.signInWithPassword({ email, password });
  return resp;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
