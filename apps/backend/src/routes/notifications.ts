import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'

export async function notificationsRoutes(server: FastifyInstance) {
  
  // Get user notifications
  server.get('/api/notifications', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { unread_only } = request.query as { unread_only?: boolean }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      let query = supabaseAdmin
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)

      if (unread_only) {
        query = query.eq('read', false)
      }

      const { data: notifications, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Get unread count
      const { count } = await supabaseAdmin
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      return reply.send({ 
        data: notifications || [], 
        unread_count: count || 0 
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Mark notification as read
  server.post('/api/notifications/:id/read', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { id } = request.params as { id: string }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      const { error } = await supabaseAdmin
        .from('user_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return reply.send({ success: true })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Mark all as read
  server.post('/api/notifications/read-all', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      const { error } = await supabaseAdmin
        .from('user_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      return reply.send({ success: true })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Create notification (internal use)
  server.post('/api/notifications/create', async (request, reply) => {
    const {
      user_id,
      type,
      title,
      message,
      action_url,
      action_label,
      reference_id,
      reference_type
    } = request.body as {
      user_id: string
      type: string
      title: string
      message: string
      action_url?: string
      action_label?: string
      reference_id?: string
      reference_type?: string
    }

    try {
      const { data: notification, error } = await supabaseAdmin
        .from('user_notifications')
        .insert({
          user_id,
          type,
          title,
          message,
          action_url,
          action_label,
          reference_id,
          reference_type
        })
        .select()
        .single()

      if (error) throw error

      return reply.send({ data: notification })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}

