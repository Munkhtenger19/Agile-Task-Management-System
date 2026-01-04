"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { columnWithTasks, Task } from "@/lib/supabase/models";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus, Sparkles, Loader2, Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DroppableColumn, CreateTaskData } from "@/components/board/DroppableColumn";
import { SortableTask } from "@/components/board/SortableTask";
import { Badge } from "@/components/ui/badge";

export default function BoardPage() {
  const params = useParams();
  const {
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
  } = useBoard(params.id as string);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isGenerateTasksOpen, setIsGenerateTasksOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<columnWithTasks | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading board...</p>
        </div>
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Board not found</div>;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    const overTaskIndex = overColumn.tasks.findIndex(
      (task) => task.id === overId
    );

    let newIndex: number;
    if (overId === overColumn.id) {
      newIndex = overColumn.tasks.length;
    } else {
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : 0;
    }

    await moveTask(activeId, overColumn.id, newIndex);
    setActiveTask(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumns((prev) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;
      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems.findIndex((t) => t.id === overId);

      let newIndex;
      if (overId === overColumn.id) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((c) => {
        if (c.id === activeColumn.id) {
          return {
            ...c,
            tasks: activeItems.filter((t) => t.id !== activeId),
          };
        } else if (c.id === overColumn.id) {
          return {
            ...c,
            tasks: [
              ...overItems.slice(0, newIndex),
              activeItems[activeIndex],
              ...overItems.slice(newIndex, overItems.length),
            ],
          };
        } else {
          return c;
        }
      });
    });
  }

  const handleCreateTask = async (columnId: string, taskData: CreateTaskData) => {
    await createRealTask(columnId, taskData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        boardTitle={board.title}
        onEditBoard={() => setIsEditBoardOpen(true)}
        onGenerateTasks={() => setIsGenerateTasksOpen(true)}
      />

      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full p-4 sm:p-6 inline-flex items-start space-x-4">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                onCreateTask={(data) => handleCreateTask(column.id, data)}
                onEditColumn={setEditingColumn}
              >
                <SortableContext
                  items={column.tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[10px]">
                    {column.tasks.map((task) => (
                      <SortableTask key={task.id} task={task} onClick={setSelectedTask} />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            ))}
            <DragOverlay>
              {activeTask ? <SortableTask task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>

          {/* Add Column Button */}
          <div className="w-80 flex-shrink-0">
            <Dialog
              open={isCreateColumnOpen}
              onOpenChange={setIsCreateColumnOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed border-2 hover:border-blue-500 hover:text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New List</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const title = formData.get("title") as string;
                    if (title) {
                      await createColumn(title);
                      setIsCreateColumnOpen(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="title">List Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., To Do, In Progress"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create List
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      {/* Edit Board Dialog */}
      <Dialog open={isEditBoardOpen} onOpenChange={setIsEditBoardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await updateBoard(board.id, {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
              });
              setIsEditBoardOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Board Title</Label>
              <Input
                name="title"
                defaultValue={board.title}
                placeholder="Board Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                defaultValue={board.description || ""}
                placeholder="Board Description"
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog
        open={!!editingColumn}
        onOpenChange={(open) => !open && setEditingColumn(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingColumn) return;
              const formData = new FormData(e.currentTarget);
              await updateColumn(
                editingColumn.id,
                formData.get("title") as string
              );
              setEditingColumn(null);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>List Title</Label>
              <Input
                name="title"
                defaultValue={editingColumn?.title}
                placeholder="List Title"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Tasks Dialog */}
      <Dialog open={isGenerateTasksOpen} onOpenChange={setIsGenerateTasksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Magic Breakdown</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const description = formData.get("description") as string;
              setIsGenerateTasksOpen(false);
              await generateTasks(description);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>What is this board about?</Label>
              <Textarea
                name="description"
                placeholder="Describe your project or goal to help AI generate better tasks..."
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Tasks
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedTask?.title}
              <Badge variant="secondary" className={
                selectedTask?.priority === 'high' ? 'bg-red-500 text-white' :
                selectedTask?.priority === 'medium' ? 'bg-yellow-500 text-white' :
                'bg-green-500 text-white'
              }>
                {selectedTask?.priority}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                {selectedTask?.description || "No description provided."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedTask?.due_date 
                      ? new Date(selectedTask.due_date).toLocaleDateString() 
                      : "No due date"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
