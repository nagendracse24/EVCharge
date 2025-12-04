import { FastifyPluginAsync } from 'fastify'
import { supabase } from '../db/supabase'

export const bookingsRoutes: FastifyPluginAsync = async (server) => {
  // Get available slots for a station/connector
  server.get('/api/bookings/slots/available', async (request, reply) => {
    const { station_id, connector_id, date, duration_minutes } = request.query as {
      station_id: string
      connector_id: string
      date: string // YYYY-MM-DD
      duration_minutes?: string
    }

    if (!station_id || !connector_id || !date) {
      return reply.code(400).send({ error: 'Missing required parameters' })
    }

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_station_id: station_id,
        p_connector_id: connector_id,
        p_booking_date: date,
        p_slot_duration_minutes: duration_minutes ? parseInt(duration_minutes) : 60,
      })

      if (error) throw error

      return reply.send({ data })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // Create a booking
  server.post('/api/bookings', async (request, reply) => {
    const {
      station_id,
      connector_id,
      booking_date,
      start_time,
      end_time,
      duration_minutes,
      vehicle_id,
      vehicle_name,
      estimated_energy_kwh,
      estimated_cost,
      special_instructions,
    } = request.body as any

    // Get user from auth header (you'll need to implement auth middleware)
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    // For now, mock user_id - you should get this from JWT token
    const user_id = '00000000-0000-0000-0000-000000000000' // Replace with actual user

    try {
      // Check slot availability
      const { data: isAvailable, error: checkError } = await supabase.rpc(
        'check_slot_availability',
        {
          p_station_id: station_id,
          p_connector_id: connector_id,
          p_booking_date: booking_date,
          p_start_time: start_time,
          p_end_time: end_time,
        }
      )

      if (checkError) throw checkError

      if (!isAvailable) {
        return reply.code(409).send({ error: 'Slot not available' })
      }

      // Create booking
      const { data: booking, error } = await supabase
        .from('slot_bookings')
        .insert({
          user_id,
          station_id,
          connector_id,
          booking_date,
          start_time,
          end_time,
          duration_minutes,
          vehicle_id,
          vehicle_name,
          estimated_energy_kwh,
          estimated_cost,
          special_instructions,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return reply.code(201).send({ data: booking })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // Get user's bookings
  server.get('/api/bookings/my', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    // Mock user_id - replace with actual JWT parsing
    const user_id = '00000000-0000-0000-0000-000000000000'

    try {
      const { data, error } = await supabase
        .from('slot_bookings')
        .select(
          `
          *,
          station:stations(name, address, city, latitude, longitude),
          connector:station_connectors(connector_type, power_kw)
        `
        )
        .eq('user_id', user_id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) throw error

      return reply.send({ data })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // Cancel a booking
  server.post('/api/bookings/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { cancellation_reason } = request.body as any

    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    try {
      const { data, error } = await supabase
        .from('slot_bookings')
        .update({
          status: 'cancelled',
          cancellation_reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return reply.send({ data, message: 'Booking cancelled successfully' })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // Get booking details
  server.get('/api/bookings/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const { data, error } = await supabase
        .from('slot_bookings')
        .select(
          `
          *,
          station:stations(*),
          connector:station_connectors(*)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return reply.send({ data })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // Get station's slot configuration
  server.get('/api/bookings/config/:station_id', async (request, reply) => {
    const { station_id } = request.params as { station_id: string }

    try {
      const { data, error } = await supabase
        .from('station_slot_config')
        .select('*')
        .eq('station_id', station_id)
        .single()

      if (error) throw error

      return reply.send({ data })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })
}

