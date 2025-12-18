"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

type SupabaseContextType = {
  supabase: SupabaseClient | null;
  isLoading: boolean;
};
const Context = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!session) return;
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        accessToken: async () => session?.getToken() ?? null,
      }
    );
    setSupabase(client);
    setIsLoading(false);
  }, [session]);
  return (
    <Context.Provider value={{ supabase, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
