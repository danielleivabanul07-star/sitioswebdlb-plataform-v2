import { supabase } from "../src/config/db.js";

export async function readUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function saveUser(user) {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}