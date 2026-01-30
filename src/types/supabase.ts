export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            evidence: {
                Row: {
                    id: string
                    job_id: string
                    local_path: string | null
                    type: Database["public"]["Enums"]["evidence_type"]
                    uploaded_at: string | null
                    url: string
                }
                Insert: {
                    id?: string
                    job_id: string
                    local_path?: string | null
                    type: Database["public"]["Enums"]["evidence_type"]
                    uploaded_at?: string | null
                    url: string
                }
                Update: {
                    id?: string
                    job_id?: string
                    local_path?: string | null
                    type?: Database["public"]["Enums"]["evidence_type"]
                    uploaded_at?: string | null
                    url?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "evidence_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    },
                ]
            }
            jobs: {
                Row: {
                    address: string
                    amount: number | null
                    assigned_to: string | null
                    client_name: string
                    created_at: string | null
                    description: string | null
                    id: string
                    status: Database["public"]["Enums"]["job_status"] | null
                    title: string
                }
                Insert: {
                    address: string
                    amount?: number | null
                    assigned_to?: string | null
                    client_name: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    status?: Database["public"]["Enums"]["job_status"] | null
                    title: string
                }
                Update: {
                    address?: string
                    amount?: number | null
                    assigned_to?: string | null
                    client_name?: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    status?: Database["public"]["Enums"]["job_status"] | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "jobs_assigned_to_fkey"
                        columns: ["assigned_to"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    phone: string | null
                    role: Database["public"]["Enums"]["user_role"] | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            evidence_type: "photo" | "signature"
            job_status: "pending" | "completed" | "approved" | "paid"
            user_role: "admin" | "installer"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
