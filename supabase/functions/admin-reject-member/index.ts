import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { targetUserId } = await req.json()

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Missing targetUserId.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user: callingUser },
      error: userError,
    } = await callerClient.auth.getUser()

    if (userError || !callingUser) {
      return new Response(JSON.stringify({ error: 'Invalid session.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerRow, error: callerRowError } = await adminClient
      .from('users')
      .select('roles, club_id')
      .eq('id', callingUser.id)
      .single()

    if (callerRowError || !callerRow) {
      return new Response(JSON.stringify({ error: 'Caller profile not found.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isSuperAdmin = callerRow.roles?.includes('super_admin')
    const isClubAdmin = callerRow.roles?.includes('club_admin')

    if (!isSuperAdmin && !isClubAdmin) {
      return new Response(JSON.stringify({ error: 'Only admins can reject members.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: targetRow, error: targetRowError } = await adminClient
      .from('users')
      .select('club_id, status')
      .eq('id', targetUserId)
      .single()

    if (targetRowError || !targetRow) {
      return new Response(JSON.stringify({ error: 'Target user not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (isClubAdmin && !isSuperAdmin && targetRow.club_id !== callerRow.club_id) {
      return new Response(JSON.stringify({ error: 'Can only reject members within your own club.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Safety: only allow this action on pending members, not active ones —
    // prevents accidental deletion of an established member's account.
    if (targetRow.status !== 'pending_approval') {
      return new Response(JSON.stringify({ error: 'Can only reject pending members.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete the users table row first, then the Auth account.
    const { error: deleteRowError } = await adminClient.from('users').delete().eq('id', targetUserId)
    if (deleteRowError) {
      return new Response(JSON.stringify({ error: deleteRowError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteAuthError) {
      return new Response(JSON.stringify({ error: deleteAuthError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('admin-reject-member error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})