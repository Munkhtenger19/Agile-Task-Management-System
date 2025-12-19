"use client";
import BoardCard from "@/components/BoardCard";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import {
  BookMarked,
  Filter,
  Grid3X3,
  Icon,
  List,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { createBoard, boards, loading, error } = useBoards();
  const [view, setView] = useState<"grid" | "list">("grid");

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
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setView("grid")}
                >
                  <Grid3X3 />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setView("list")}
                >
                  <List />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Filter />
                Filter
              </Button>
              <Button>
                <Plus />
                Create Board
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="search"
              placeholder="Search boards..."
              className="pl-10"
            />
          </div>

          {boards.length === 0 ? (
            <div className="">no boards yet</div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {boards.map((board) => (
                <Link href={`/boards/${board.id}`} key={board.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div className={`size-4 ${board.color} rounded`} />
                        <Badge className="text-xs" variant="secondary">
                          {" "}
                          new
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="sm:text-lg mb-2 group-hover:text-blue">
                        {board.title}
                      </CardTitle>
                      <CardDescription>
                        {board.description || "No description"}
                      </CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ">
                        <span>Created at: </span>
                        {new Date(board.created_at).toLocaleDateString()}
                        <span>Updated at: </span>
                        {new Date(board.updated_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Card className="border-2 border-dashe border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="size-6 sm:size-8 group-hover:text-blue-600" />
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                    Create New Board
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="">
              {boards.map((board, key) => (
                <div key={key} className={key > 0 ? "mt-4" : ""}>
                  <Link href={`/boards/${board.id}`} key={board.id}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <div className={`size-4 ${board.color} rounded`} />
                          <Badge className="text-xs" variant="secondary">
                            {" "}
                            new
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="sm:text-lg mb-2 group-hover:text-blue">
                          {board.title}
                        </CardTitle>
                        <CardDescription>
                          {board.description || "No description"}
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ">
                          <span>Created at: </span>
                          {new Date(board.created_at).toLocaleDateString()}
                          <span>Updated at: </span>
                          {new Date(board.updated_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                </div>
                ))}
                <Card className="mt-4 border-2 border-dashe border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Plus className="size-6 sm:size-8 group-hover:text-blue-600" />
                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                      Create New Board
                    </p>
                  </CardContent>
                </Card>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}
