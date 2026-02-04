import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'pending')
        .not('assigned_to', 'is', null)

    return NextResponse.json({
        jobIds: jobs?.map(j => j.id) || []
    })
}
