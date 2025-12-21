"use client";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MoreHorizontal, Plus, User } from "lucide-react";
import { useParams } from "next/navigation";
import React, { act, useState } from "react";
import { columnWithTasks, Task, Task as TaskType } from "@/lib/supabase/models";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column?: columnWithTasks;
  children?: React.ReactNode;
  onCreateTask?: (taskData: Task) => Promise<void>;
  onEditColumn?: (column: columnWithTasks) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full lg:flex-shrink-0 ${
        isOver ? "bg-blue-50 rounded-lg" : ""
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border ${
          isOver ? "ring-2 ring-blue-300" : ""
        }`}
      >
        <div className="border-b p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">
                {column?.title}
              </h3>
              <Badge>{column?.tasks.length || 0}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
        <div className="p-2">{children}</div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700 mt-3"
            >
              <Plus />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Create new task</DialogTitle>
              <p className="text-sm text-gray-500">Add new task</p>
            </DialogHeader>
            <form className="space-y-4" onSubmit={onCreateTask}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="Medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" name="dueDate" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SortableTask({ task }: { task: TaskType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: task.id });
  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  function getPriorityColor(priority: "low" | "medium" | "high") {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={styles}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm flex-1 leading-tight">
                {task.title}
              </h4>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "no description"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 space-x-2 items-center">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="size-3" />
                    <span>{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar />
                    <span>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`size-2 rounded-full flex-shrink-0 ${getPriorityColor(
                  task.priority
                )}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskOverlay({ task }: { task: TaskType }) {
  function getPriorityColor(priority: "low" | "medium" | "high") {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  }
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm flex-1 leading-tight">
              {task.title}
            </h4>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description || "no description"}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 space-x-2 items-center">
              {task.assignee && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <User className="size-3" />
                  <span>{task.assignee}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar />
                  <span>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div
              className={`size-2 rounded-full flex-shrink-0 ${getPriorityColor(
                task.priority
              )}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    updateBoard,
    columns,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
  } = useBoard(id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(board?.title || "");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState<boolean>(false);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const handleUpdateBoardTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, { title: newTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.log(error);
    }
  };

  async function createTask(taskData: {
    title: string;
    description?: string;
    assignee?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }) {
    const targetColumn = columns[0];
    if (!targetColumn) throw new Error("No columns available to add the task.");

    await createRealTask(targetColumn.id, taskData);
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
      dueDate: formData.get("dueDate") as string | undefined,
    };
    if (taskData.title.trim()) {
      await createTask(taskData);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );
    if (!sourceColumn || !targetColumn) return;
    if (sourceColumn.id === targetColumn.id) {
      const activeTaskIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );
      const overTaskIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId
      );
      if (activeTaskIndex !== overTaskIndex) {
        setColumns((prev: columnWithTasks[]) => {
          const newCols = [...prev];
          const col = newCols.find((col) => col.id === sourceColumn.id);
          if (col) {
            const tasks = Array.from(col.tasks);
            const [removed] = tasks.splice(activeTaskIndex, 1);
            tasks.splice(overTaskIndex, 0, removed);
            col.tasks = tasks;
          }
          return newCols;
        });
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const targetCol = columns.find((col) => col.id === overId);
    if (targetCol) {
      const sourceCol = columns.find((col) =>
        col.tasks.some((task) => task.id === activeId)
      );
      if (sourceCol && sourceCol.id !== targetCol.id) {
        await moveTask(activeId, targetCol.id, targetCol.tasks.length);
      } else if (sourceCol && sourceCol.id === targetCol.id) {
        const oldIndex = sourceCol.tasks.findIndex(
          (task) => task.id === activeId
        );
        const newIndex = targetCol.tasks.findIndex(
          (task) => task.id === overId
        );
        if (oldIndex !== newIndex) {
          await moveTask(activeId, targetCol.id, newIndex);
        }
      }
    }
  };

  async function handleCreateColumn(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!newColumnTitle.trim() || !board) return;
    await createColumn(newColumnTitle.trim());
  }
  return (
    <div className="min-h-screen bg-gray-60">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => setIsEditingTitle(true)}
      />
      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Board Title</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBoardTitle}>
            <div>
              <Label htmlFor="board-title">Board Title</Label>
              <Input
                id="board-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="Enter board title"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingTitle(false)}
              >
                {" "}
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <main className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-sm text-gray-600">
              <span>
                Total tasks:{" "}
                {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
              </span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>Create new task</DialogTitle>
                <p className="text-sm text-gray-500">Add new task</p>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="Enter assignee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="Medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High"].map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" name="dueDate" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col lg:flex-row lg:space-x-4">
            {columns.map((column, key) => (
              <DroppableColumn
                column={column}
                key={key}
                onCreateTask={handleCreateTask}
                onEditColumn={() => {}}
              >
                <SortableContext
                  items={column.tasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {column.tasks.map((task, key) => (
                      <SortableTask key={key} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            ))}
            <div className="w-full lg:flex-shrink-0 lg:w-80">
              <Button
                variant="outline"
                className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsCreatingColumn(true)}
              >
                <Plus />
                Add another column
              </Button>
            </div>
            <DragOverlay>
              {activeTask ? <TaskOverlay task={activeTask} /> : null}
            </DragOverlay>
          </div>
        </DndContext>
      </main>
      <Dialog open={isCreatingColumn} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
            <p className="text-sm text-gray-500">
              Add new column to organize your tasks
            </p>
          </DialogHeader>
          <form onSubmit={handleCreateColumn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                required
                placeholder="Enter column title"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingColumn(false)}
              >
                {" "}
                Cancel
              </Button>
              <Button type="submit">Create Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
