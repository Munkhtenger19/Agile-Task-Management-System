export interface Board {
    id: string;
    title: string;
    description: string | null;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: string;
    title: string;
    board_id: string;
    created_at: string;
    sort_order: number;
    user_id: string;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    column_id: string;
    assignee: string | null;
    due_date: string | null;
    sort_order: number;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}