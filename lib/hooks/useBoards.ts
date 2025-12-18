"use client";
import { use, useCallback, useEffect, useState } from "react";
import { boardDataService } from "../services";
import { Board } from "../supabase/models";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    try {
      setLoading(true);
      setError(null);
      const boards = await boardDataService.getBoards(supabase!, user.id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load boards"
      );
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    loadBoards();
  }, [user, supabase, loadBoards]);
  const createBoard = async (boardData: {
    title: string;
    description?: string;
    color?: string;
  }) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        { ...boardData, userId: user.id }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return {
    boards,
    loading,
    createBoard,
    error
  };
}
