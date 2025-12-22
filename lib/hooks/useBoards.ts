"use client";
import { use, useCallback, useEffect, useState } from "react";
import {
  boardDataService,
  boardService,
  columnService,
  taskService,
} from "../services";
import { Board, Column, columnWithTasks, Task } from "../supabase/models";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "../supabase/SupabaseProvider";
import { generateSubtasks, generateBoardTasks } from "@/lib/ai";
import { toast } from "sonner";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<columnWithTasks[]>([]);
  
  const loadBoards = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    try {
      setLoading(true);
      setError(null);
      const boards = await boardDataService.getBoards(supabase!, user.id);
      setBoards(boards);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load boards"
      );
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
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
      toast.success("Board created successfully");
      return newBoard;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setError(message);
      toast.error(`Failed to create board: ${message}`);
      throw error;
    }
  };

  return {
    boards,
    loading,
    createBoard,
    error,
  };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const { user } = useUser();
  const [columns, setColumns] = useState<columnWithTasks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!boardId) throw new Error("User not authenticated");
    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load boards"
      );
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [supabase, loadBoard, boardId]);
  console.log("board", board);

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      toast.success("Board updated successfully");
      return updatedBoard;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setError(message);
      toast.error(`Failed to update board: ${message}`);
    }
  }
  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
    }
  ) {
    try {
      // AI Feature: Auto-generate subtasks description if description is empty
      let description = taskData.description;
      if (!description && taskData.title.length > 10) {
        toast.info("Generating AI subtasks...");
        const subtasks = await generateSubtasks(taskData.title);
        if (subtasks && subtasks.length > 0) {
          description = "AI Generated Subtasks:\n" + subtasks.map((t: string) => `- [ ] ${t}`).join("\n");
          toast.success("AI subtasks generated!");
        }
      }

      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: description || null,
        column_id: columnId,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        priority: taskData.priority || "medium",
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
      });
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: [...col.tasks, newTask],
              }
            : col
        )
      );
      toast.success("Task created successfully");

      return newTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create task";
      setError(message);
      toast.error(message);
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newSortOrder: number
  ) {
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newSortOrder);
      setColumns((prev) => {
        // const newCols = [...prev]
        let taskToMove: Task | null = null;
        const newCols = prev.map((col) => {
          const taskIdx = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIdx !== -1) {
            taskToMove = col.tasks[taskIdx];
            col.tasks.splice(taskIdx, 1);
            // col.tasks.splice(newSortOrder, 0, taskToMove)
          }
          return col;
        });
        if (taskToMove) {
          const newCol = newCols.find((col) => col.id === newColumnId);
          if (newCol) {
            newCol.tasks.splice(newSortOrder, 0, taskToMove);
          }
        }
        return newCols;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to move task";
      setError(message);
      toast.error(message);
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");
    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });
      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      toast.success("Column created successfully");
      return newColumn;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create column";
      setError(message);
      toast.error(message);
    }
  }

  async function updateColumn(colId: string, title: string) {
    try {
      const newColumn = await columnService.updateColumnTitle(
        supabase!,
        colId,
        title
      );
      setColumns((prev) => prev.map(col => col.id === colId ? { ...col, ...newColumn } : col));
      toast.success("Column updated successfully");
      return newColumn;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update column";
      setError(message);
      toast.error(message);
    }
  }

  async function generateTasks() {
    if (!board) return;
    try {
      toast.info("Generating tasks with AI...");
      const tasks = await generateBoardTasks(board.title);
      
      if (!tasks || tasks.length === 0) {
        toast.error("Failed to generate tasks");
        return;
      }

      // Find the first column (usually "To Do")
      const targetColumn = columns[0];
      if (!targetColumn) {
        toast.error("No columns found to add tasks to");
        return;
      }

      // Create tasks sequentially
      for (const task of tasks) {
        await createRealTask(targetColumn.id, {
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
      }
      
      toast.success(`Generated ${tasks.length} tasks successfully!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tasks");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    generateTasks,
  };
}
