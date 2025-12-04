import { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'

export async function favoritesRoutes(server: FastifyInstance) {
  // GET /api/favorites - Get user's favorite stations
  server.get('/api/favorites', async (request, reply) => {
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

      // Get user's favorites with station details
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          created_at,
          station:stations (
            id,
            name,
            network,
            latitude,
            longitude,
            address,
            city,
            is_24x7,
            parking_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return reply.send({
        data: favorites?.map(f => ({
          favorite_id: f.id,
          created_at: f.created_at,
          ...f.station,
        })) || [],
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/favorites - Add station to favorites
  server.post<{ Body: { station_id: string } }>('/api/favorites', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { station_id } = request.body

    if (!station_id) {
      return reply.code(400).send({ error: { message: 'station_id is required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('station_id', station_id)
        .single()

      if (existing) {
        return reply.code(400).send({ error: { message: 'Station already in favorites' } })
      }

      // Add to favorites
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          station_id,
        })
        .select()
        .single()

      if (error) throw error

      return reply.code(201).send({ data })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // DELETE /api/favorites/:station_id - Remove from favorites
  server.delete<{ Params: { station_id: string } }>(
    '/api/favorites/:station_id',
    async (request, reply) => {
      const authHeader = request.headers.authorization
      if (!authHeader) {
        return reply.code(401).send({ error: { message: 'Authentication required' } })
      }

      const { station_id } = request.params

      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
          return reply.code(401).send({ error: { message: 'Invalid token' } })
        }

        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('station_id', station_id)

        if (error) throw error

        return reply.send({ data: { success: true } })
      } catch (error: any) {
        server.log.error(error)
        return reply.code(500).send({ error: { message: error.message } })
      }
    }
  )

  // GET /api/favorites/check/:station_id - Check if station is favorited
  server.get<{ Params: { station_id: string } }>(
    '/api/favorites/check/:station_id',
    async (request, reply) => {
      const authHeader = request.headers.authorization
      if (!authHeader) {
        return reply.send({ data: { is_favorite: false } })
      }

      const { station_id } = request.params

      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
          return reply.send({ data: { is_favorite: false } })
        }

        const { data } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('station_id', station_id)
          .single()

        return reply.send({ data: { is_favorite: !!data } })
      } catch (error: any) {
        return reply.send({ data: { is_favorite: false } })
      }
    }
  )
}

