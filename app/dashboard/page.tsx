import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import React from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { createBoard } = useBoards();

  const handleCreateBoard = async (event: MouseEvent) => {
    await createBoard();
  };
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
      </main>
    </div>
  );
}
