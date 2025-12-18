"use client";
import BoardCard from "@/components/BoardCard";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import { BookMarked, Filter, Grid3X3, Icon, List, Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { createBoard, boards, loading, error } = useBoards();
  const [view, setView] = useState<"grid" | "list"> ("grid");

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" });
  };

  if (loading) {
    return (
      <div>
        <Loader2 />
        <span>Loading your boards...</span>
      </div>
    );
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="min-h-screen ">
      <Navbar />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>
          Welcome to your dashboard! Here you can manage your projects and
          tasks.
        </p>
        <Button className="w-full sm:w-auto" onClick={handleCreateBoard}>
          <Plus size={4}></Plus>Create board
        </Button>
        <BoardCard text="Total Boards" boardsNum={boards.length} />
        <BoardCard
          text="Recent Activities"
          boardsNum={
            boards.filter((board) => {
              const updatedAt = new Date(board.updated_at);
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return updatedAt >= oneWeekAgo;
            }).length
          }
        />
        <BoardCard text="Active Projects" boardsNum={boards.length} />
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="">
              <h2 className="text-xl sm:text-2xl font-bold">Your Boards</h2>
              <p className="text-gray-600">Manage your projects and tasks</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 bg-white border p-1">
                <Button variant={view === "grid" ? "default" : "ghost"} size="icon" onClick={() => setView("grid")}>
                  <Grid3X3 />
                </Button>
                <Button variant={view === "list" ? "default" : "ghost"} size="icon" onClick={() => setView("list")}>
                  <List />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Filter />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
