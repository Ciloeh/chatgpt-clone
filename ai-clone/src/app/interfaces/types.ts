// src/types.ts
export interface MessageType {
  id: string;
  content: string;
  user_id: string;
  conversation_id: string;
  tokens_used?: number;
  response_time_ms?: number;
  group_id?: string;
  created_at: string;
  role: 'user' | 'assistant'; // Add the role property
  parent_id?: string; // Add the optional parent_id property
}

  
  export interface BranchType {
    id: string;
    original_message_id: string;
    edited_message_id: string;
    created_at: string;
  }
  
  // Define response type for Supabase queries
  export interface SupabaseResponse<T> {
    data: T | null;
    error: Error | null;
  }
  