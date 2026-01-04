import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/supabase/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface SortableTaskProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function SortableTask({ task, onClick }: SortableTaskProps) {
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
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={styles}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="group relative"
    >
      <Card className={`
        mb-3 cursor-grab active:cursor-grabbing 
        hover:shadow-lg hover:border-blue-200 hover:ring-1 hover:ring-blue-100
        transition-all duration-200 ease-in-out
        bg-white border-gray-200
        ${isDragging ? 'shadow-xl ring-2 ring-blue-400 rotate-2 scale-105 z-50' : ''}
      `}>
        <CardContent className="p-3 sm:p-4 space-y-3">
          {/* Header with Title and Priority */}
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
              {task.title}
            </h4>
            <div className="flex-shrink-0">
              <Badge
                variant="outline"
                className={`${getPriorityColor(
                  task.priority
                )} text-[10px] sm:text-xs px-2 py-0.5 font-medium border uppercase tracking-wide`}
              >
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* Description Preview */}
          {task.description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer with Metadata */}
          <div className="flex items-center justify-end pt-2 border-t border-gray-50 mt-2">
            {task.due_date && (
              <div className={`
                flex items-center text-xs px-2 py-1 rounded-full
                ${new Date(task.due_date) < new Date() ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}
              `}>
                <Calendar className="h-3 w-3 mr-1.5" />
                <span className="font-medium">{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
