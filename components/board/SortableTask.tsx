import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/supabase/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface SortableTaskProps {
  task: Task;
}

export function SortableTask({ task }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }

  return (
    <div ref={setNodeRef} style={styles} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
              {task.title}
            </h4>
            <Badge
              variant="secondary"
              className={`${getPriorityColor(
                task.priority
              )} text-white text-[10px] sm:text-xs px-1.5 py-0.5`}
            >
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400">
            {task.assignee && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span className="max-w-[80px] truncate">{task.assignee}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
