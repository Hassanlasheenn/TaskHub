export interface ITodoCreate {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
}

export interface ITodoUpdate {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
    category?: string;
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
}

export interface ITodoListResponse {
    todos: ITodoResponse[];
    total: number;
}

