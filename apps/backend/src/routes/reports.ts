import { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'

/**
 * Real-time reports routes
 * Handles user-reported pricing and availability updates
 */
export async function reportsRoutes(server: FastifyInstance) {
  
  // Report current price
  server.post('/price', async (request, reply) => {
    const { station_id, connector_type, price_per_kwh, user_id } = request.body as {
      station_id: string
      connector_type: string
      price_per_kwh: number
      user_id: string
    }

    if (!station_id || !connector_type || !price_per_kwh || !user_id) {
      return reply.code(400).send({ error: 'Missing required fields' })
    }

    try {
      // Insert price report
      const { data: report, error } = await supabase
        .from('user_price_reports')
        .insert({
          station_id,
          user_id,
          connector_type,
          price_per_kwh,
          verified: false, // Will be verified later by admins or voting
        })
        .select()
        .single()

      if (error) throw error

      // Update user reputation
      await supabase.rpc('increment_user_reports', { p_user_id: user_id })

      return reply.send({ data: report })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to submit price report' })
    }
  })

  // Report current availability
  server.post('/availability', async (request, reply) => {
    const { 
      station_id, 
      status, 
      available_count, 
      total_count, 
      wait_time_minutes,
      user_id 
    } = request.body as {
      station_id: string
      status: string
      available_count: number
      total_count: number
      wait_time_minutes?: number
      user_id: string
    }

    if (!station_id || !status || total_count === undefined || !user_id) {
      return reply.code(400).send({ error: 'Missing required fields' })
    }

    try {
      // Insert availability report
      const { data: report, error } = await supabase
        .from('user_availability_reports')
        .insert({
          station_id,
          user_id,
          status,
          available_count: available_count || 0,
          total_count,
          wait_time_minutes,
          verified: false,
        })
        .select()
        .single()

      if (error) throw error

      // Update user reputation
      await supabase.rpc('increment_user_reports', { p_user_id: user_id })

      return reply.send({ data: report })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to submit availability report' })
    }
  })

  // Get latest reports for a station
  server.get('/station/:stationId', async (request, reply) => {
    const { stationId } = request.params as { stationId: string }

    try {
      // Get latest price reports (last 24 hours)
      const { data: priceReports } = await supabase
        .from('user_price_reports')
        .select('*')
        .eq('station_id', stationId)
        .gte('report_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('report_time', { ascending: false })
        .limit(5)

      // Get latest availability reports (last 4 hours)
      const { data: availabilityReports } = await supabase
        .from('user_availability_reports')
        .select('*')
        .eq('station_id', stationId)
        .gte('report_time', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
        .order('report_time', { ascending: false })
        .limit(5)

      return reply.send({
        data: {
          price_reports: priceReports || [],
          availability_reports: availabilityReports || [],
        }
      })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to fetch reports' })
    }
  })

  // Vote on a report (upvote/downvote)
  server.post('/vote', async (request, reply) => {
    const { report_id, report_type, vote_type, user_id } = request.body as {
      report_id: string
      report_type: 'price' | 'availability'
      vote_type: 'upvote' | 'downvote'
      user_id: string
    }

    if (!report_id || !report_type || !vote_type || !user_id) {
      return reply.code(400).send({ error: 'Missing required fields' })
    }

    try {
      // Insert or update vote
      const { error: voteError } = await supabase
        .from('report_votes')
        .upsert({
          user_id,
          report_id,
          report_type,
          vote_type,
        }, {
          onConflict: 'user_id,report_id,report_type'
        })

      if (voteError) throw voteError

      // Update vote counts on the report
      const table = report_type === 'price' ? 'user_price_reports' : 'user_availability_reports'
      const column = vote_type === 'upvote' ? 'upvotes' : 'downvotes'

      const { error: updateError } = await supabase.rpc('increment_vote_count', {
        p_table: table,
        p_report_id: report_id,
        p_column: column,
      })

      if (updateError) throw updateError

      // Auto-verify reports with high upvote ratio
      await supabase.rpc('auto_verify_reports')

      return reply.send({ success: true })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to submit vote' })
    }
  })

  // Get user reputation
  server.get('/reputation/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string }

    try {
      const { data: reputation } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', userId)
        .single()

      return reply.send({ data: reputation || null })
    } catch (err: any) {
      server.log.error(err)
      return reply.code(500).send({ error: 'Failed to fetch reputation' })
    }
  })
}


