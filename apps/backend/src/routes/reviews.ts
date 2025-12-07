import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'

export async function reviewsRoutes(server: FastifyInstance) {
  
  // GET /api/reviews/station/:station_id - Get reviews for a station
  server.get<{
    Params: { station_id: string }
    Querystring: { limit?: number; sort?: 'recent' | 'helpful' | 'rating' }
  }>('/api/reviews/station/:station_id', async (request, reply) => {
    const { station_id } = request.params
    const limit = request.query.limit || 20
    const sort = request.query.sort || 'recent'

    try {
      let query = supabaseAdmin
        .from('station_reviews')
        .select('*')
        .eq('station_id', station_id)
        .eq('is_approved', true)
        .limit(limit)

      // Apply sorting
      if (sort === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (sort === 'helpful') {
        query = query.order('helpful_count', { ascending: false })
      } else if (sort === 'rating') {
        query = query.order('rating', { ascending: false })
      }

      const { data: reviews, error } = await query

      if (error) throw error

      return reply.send({ data: reviews || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/reviews - Create a new review
  server.post<{
    Body: {
      station_id: string
      rating: number
      title?: string
      comment?: string
      cleanliness_rating?: number
      reliability_rating?: number
      value_rating?: number
      booking_id?: string
    }
  }>('/api/reviews', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { 
      station_id, 
      rating, 
      title, 
      comment,
      cleanliness_rating,
      reliability_rating,
      value_rating,
      booking_id
    } = request.body

    if (!station_id || !rating || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: { message: 'Valid station_id and rating (1-5) are required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Check if user already reviewed this station
      const { data: existing } = await supabaseAdmin
        .from('station_reviews')
        .select('id')
        .eq('station_id', station_id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        return reply.code(400).send({ error: { message: 'You have already reviewed this station. You can update your existing review.' } })
      }

      // Check if booking_id belongs to user (if provided)
      let is_verified_booking = false
      if (booking_id) {
        const { data: booking } = await supabaseAdmin
          .from('slot_bookings')
          .select('id')
          .eq('id', booking_id)
          .eq('user_id', user.id)
          .eq('station_id', station_id)
          .single()
        
        is_verified_booking = !!booking
      }

      // Create review
      const { data: review, error } = await supabaseAdmin
        .from('station_reviews')
        .insert({
          station_id,
          user_id: user.id,
          rating,
          title,
          comment,
          cleanliness_rating,
          reliability_rating,
          value_rating,
          booking_id,
          is_verified_booking,
        })
        .select()
        .single()

      if (error) throw error

      return reply.code(201).send({ data: review })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // PUT /api/reviews/:review_id - Update a review
  server.put<{
    Params: { review_id: string }
    Body: {
      rating?: number
      title?: string
      comment?: string
      cleanliness_rating?: number
      reliability_rating?: number
      value_rating?: number
    }
  }>('/api/reviews/:review_id', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { review_id } = request.params
    const updates = request.body

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Update review
      const { data: review, error } = await supabaseAdmin
        .from('station_reviews')
        .update(updates)
        .eq('id', review_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      if (!review) {
        return reply.code(404).send({ error: { message: 'Review not found or unauthorized' } })
      }

      return reply.send({ data: review })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // DELETE /api/reviews/:review_id - Delete a review
  server.delete<{
    Params: { review_id: string }
  }>('/api/reviews/:review_id', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { review_id } = request.params

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      const { error } = await supabaseAdmin
        .from('station_reviews')
        .delete()
        .eq('id', review_id)
        .eq('user_id', user.id)

      if (error) throw error

      return reply.send({ data: { success: true } })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/reviews/:review_id/helpful - Vote review as helpful/not helpful
  server.post<{
    Params: { review_id: string }
    Body: { is_helpful: boolean }
  }>('/api/reviews/:review_id/helpful', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { review_id } = request.params
    const { is_helpful } = request.body

    if (typeof is_helpful !== 'boolean') {
      return reply.code(400).send({ error: { message: 'is_helpful must be boolean' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Upsert vote (insert or update if exists)
      const { data: vote, error } = await supabaseAdmin
        .from('review_votes')
        .upsert({
          review_id,
          user_id: user.id,
          is_helpful,
        }, {
          onConflict: 'review_id,user_id'
        })
        .select()
        .single()

      if (error) throw error

      return reply.send({ data: vote })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/reviews/:review_id/report - Report inappropriate review
  server.post<{
    Params: { review_id: string }
    Body: { reason: string }
  }>('/api/reviews/:review_id/report', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { review_id } = request.params
    const { reason } = request.body

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Mark review as reported
      const { error } = await supabaseAdmin
        .from('station_reviews')
        .update({
          is_reported: true,
          report_reason: reason,
        })
        .eq('id', review_id)

      if (error) throw error

      return reply.send({ data: { success: true } })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // GET /api/reviews/my - Get user's own reviews
  server.get('/api/reviews/my', async (request, reply) => {
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

      const { data: reviews, error } = await supabaseAdmin
        .from('station_reviews')
        .select(`
          *,
          station:stations(name, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return reply.send({ data: reviews || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}

