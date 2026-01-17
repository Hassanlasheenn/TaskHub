export interface ITodoCreate {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
    assigned_to_user_id?: number | null;
}

export interface ITodoUpdate {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
    category?: string;
    assigned_to_user_id?: number | null;
}

export interface ITodoResponse {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    priority: string;
    category?: string;
    order_index: number;
    created_at?: string;
    updated_at?: string;
    user_id: number;
    assigned_to_user_id?: number | null;
    assigned_to_username?: string | null;
}

export interface ITodoListResponse {
    todos: ITodoResponse[];
    total: number;
}

