export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TodoStatus = "active" | "completed" | "archived";
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type ActivityAction =
  | "todo_created"
  | "todo_updated"
  | "todo_completed"
  | "todo_archived"
  | "todo_deleted"
  | "todo_restored"
  | "tag_created"
  | "tag_deleted"
  | "category_created"
  | "category_deleted";

type DefaultSchema = Database["public"];

export type Tables<
  T extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Row"];

export type Views<
  T extends keyof DefaultSchema["Views"] = keyof DefaultSchema["Views"],
> = DefaultSchema["Views"][T]["Row"];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          status: TodoStatus;
          priority: TodoPriority;
          due_date: string | null;
          completed_at: string | null;
          archived_at: string | null;
          sort_order: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
          search_vector: unknown;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          status?: TodoStatus;
          priority?: TodoPriority;
          due_date?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          sort_order?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          status?: TodoStatus;
          priority?: TodoPriority;
          due_date?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          sort_order?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      todo_tags: {
        Row: {
          todo_id: string;
          tag_id: string;
        };
        Insert: {
          todo_id: string;
          tag_id: string;
        };
        Update: {
          todo_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          todo_id: string | null;
          action: ActivityAction;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          todo_id?: string | null;
          action: ActivityAction;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          todo_id?: string | null;
          action?: ActivityAction;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      todos_with_details: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          status: TodoStatus;
          priority: TodoPriority;
          due_date: string | null;
          completed_at: string | null;
          archived_at: string | null;
          sort_order: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
          search_vector: unknown;
          category_name: string | null;
          category_color: string | null;
          category_icon: string | null;
          tags: TagSummary[] | null;
        };
        Relationships: [];
      };
      activity_daily_summary: {
        Row: {
          user_id: string;
          activity_date: string;
          action: ActivityAction;
          count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      todo_status: TodoStatus;
      todo_priority: TodoPriority;
      activity_action: ActivityAction;
    };
    CompositeTypes: Record<string, never>;
  };
}

export interface TagSummary {
  id: string;
  name: string;
  color: string;
}

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Tag = Tables<"tags">;
export type Todo = Tables<"todos">;
export type ActivityLog = Tables<"activity_logs">;
export type TodoWithDetails = Views<"todos_with_details">;
export type ActivityDailySummary = Views<"activity_daily_summary">;
