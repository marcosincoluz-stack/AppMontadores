import { Database } from './supabase'

export type JobStatus = Database['public']['Enums']['job_status']
export type UserRole = Database['public']['Enums']['user_role']
export type EvidenceType = Database['public']['Enums']['evidence_type']

// Raw Row Types
export type JobRow = Database['public']['Tables']['jobs']['Row']
export type UserRow = Database['public']['Tables']['users']['Row']
export type EvidenceRow = Database['public']['Tables']['evidence']['Row']

// Composite Types (Joins)
export interface JobWithDetails extends JobRow {
    evidence: EvidenceRow[]
    installer?: {
        full_name: string | null
    }
    // Odoo Fields (Added manually until 'supabase gen types' is run)
    odoo_task_id?: number | null
    odoo_project_id?: number | null
    external_sync_status?: 'pending' | 'synced' | 'error' | string
}

export interface UserWithDetails extends UserRow {
    // Odoo Fields
    odoo_partner_id?: number | null
}

export interface EvidenceWithDetails extends EvidenceRow {
    synced_to_odoo?: boolean
}
