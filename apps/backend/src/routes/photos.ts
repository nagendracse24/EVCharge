import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'

export async function photosRoutes(server: FastifyInstance) {
  
  // GET /api/photos/station/:station_id - Get photos for a station
  server.get<{
    Params: { station_id: string }
    Querystring: { limit?: number }
  }>('/api/photos/station/:station_id', async (request, reply) => {
    const { station_id } = request.params
    const limit = request.query.limit || 20

    try {
      const { data: photos, error } = await supabaseAdmin
        .from('station_photos')
        .select('*')
        .eq('station_id', station_id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return reply.send({ data: photos || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/photos - Upload a new photo
  server.post<{
    Body: {
      station_id: string
      photo_url: string
      storage_path: string
      caption?: string
      file_size_bytes?: number
      mime_type?: string
      width?: number
      height?: number
    }
  }>('/api/photos', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { station_id, photo_url, storage_path, caption, file_size_bytes, mime_type, width, height } = request.body

    if (!station_id || !photo_url || !storage_path) {
      return reply.code(400).send({ error: { message: 'station_id, photo_url, and storage_path are required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Create photo record
      const { data: photo, error } = await supabaseAdmin
        .from('station_photos')
        .insert({
          station_id,
          user_id: user.id,
          photo_url,
          storage_path,
          caption,
          file_size_bytes,
          mime_type,
          width,
          height,
        })
        .select()
        .single()

      if (error) throw error

      return reply.code(201).send({ data: photo })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // DELETE /api/photos/:photo_id - Delete a photo
  server.delete<{
    Params: { photo_id: string }
  }>('/api/photos/:photo_id', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { photo_id } = request.params

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Get photo to verify ownership and get storage path
      const { data: photo, error: fetchError } = await supabaseAdmin
        .from('station_photos')
        .select('*')
        .eq('id', photo_id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !photo) {
        return reply.code(404).send({ error: { message: 'Photo not found or unauthorized' } })
      }

      // Delete from database
      const { error: deleteError } = await supabaseAdmin
        .from('station_photos')
        .delete()
        .eq('id', photo_id)

      if (deleteError) throw deleteError

      // TODO: Delete from Supabase Storage
      // const { error: storageError } = await supabaseAdmin.storage
      //   .from('station-photos')
      //   .remove([photo.storage_path])

      return reply.send({ data: { success: true } })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/photos/:photo_id/report - Report inappropriate photo
  server.post<{
    Params: { photo_id: string }
    Body: { reason: string }
  }>('/api/photos/:photo_id/report', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { photo_id } = request.params
    const { reason } = request.body

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Mark photo as reported
      const { error } = await supabaseAdmin
        .from('station_photos')
        .update({
          is_reported: true,
          report_reason: reason,
        })
        .eq('id', photo_id)

      if (error) throw error

      return reply.send({ data: { success: true } })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}

