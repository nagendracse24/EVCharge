import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'

export async function analyticsRoutes(server: FastifyInstance) {
  
  // Get user's charging history
  server.get('/api/analytics/history', async (request, reply) => {
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

      const { data: history, error } = await supabaseAdmin
        .from('charging_history')
        .select(`
          *,
          station:stations(name, address, city)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(50)

      if (error) throw error

      return reply.send({ data: history || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Get user stats summary
  server.get('/api/analytics/stats', async (request, reply) => {
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

      // Get aggregate stats
      const { data: stats } = await supabaseAdmin
        .from('charging_history')
        .select('energy_delivered_kwh, cost_paid, carbon_saved_kg, duration_minutes')
        .eq('user_id', user.id)

      const totalEnergy = stats?.reduce((sum, s) => sum + (s.energy_delivered_kwh || 0), 0) || 0
      const totalCost = stats?.reduce((sum, s) => sum + (s.cost_paid || 0), 0) || 0
      const totalCarbon = stats?.reduce((sum, s) => sum + (s.carbon_saved_kg || 0), 0) || 0
      const totalDuration = stats?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
      const totalSessions = stats?.length || 0

      // Get monthly breakdown
      const { data: monthlyData } = await supabaseAdmin
        .rpc('get_monthly_charging_stats', { p_user_id: user.id })

      return reply.send({
        data: {
          total_energy_kwh: totalEnergy,
          total_cost: totalCost,
          total_carbon_saved_kg: totalCarbon,
          total_duration_minutes: totalDuration,
          total_sessions: totalSessions,
          average_cost_per_session: totalSessions > 0 ? totalCost / totalSessions : 0,
          average_energy_per_session: totalSessions > 0 ? totalEnergy / totalSessions : 0,
          monthly_breakdown: monthlyData || []
        }
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Calculate carbon savings
  server.post('/api/analytics/carbon-calculator', async (request, reply) => {
    const { energy_kwh, distance_km } = request.body as {
      energy_kwh?: number
      distance_km?: number
    }

    try {
      // Carbon emissions factors
      const PETROL_EMISSIONS_KG_PER_KM = 0.171 // Average petrol car
      const GRID_EMISSIONS_KG_PER_KWH = 0.708 // India grid average
      const EV_EFFICIENCY_KWH_PER_KM = 0.15 // Average EV

      let carbonSaved = 0
      let treesEquivalent = 0

      if (distance_km) {
        // Calculate based on distance
        const petrolEmissions = distance_km * PETROL_EMISSIONS_KG_PER_KM
        const evEmissions = distance_km * EV_EFFICIENCY_KWH_PER_KM * GRID_EMISSIONS_KG_PER_KWH
        carbonSaved = petrolEmissions - evEmissions
      } else if (energy_kwh) {
        // Calculate based on energy
        const equivalentDistance = energy_kwh / EV_EFFICIENCY_KWH_PER_KM
        const petrolEmissions = equivalentDistance * PETROL_EMISSIONS_KG_PER_KM
        const evEmissions = energy_kwh * GRID_EMISSIONS_KG_PER_KWH
        carbonSaved = petrolEmissions - evEmissions
      }

      // One tree absorbs ~21 kg CO2 per year
      treesEquivalent = carbonSaved / 21 * 365

      return reply.send({
        data: {
          carbon_saved_kg: Math.max(0, carbonSaved),
          trees_equivalent: Math.max(0, treesEquivalent),
          petrol_saved_liters: distance_km ? distance_km / 15 : 0, // Assuming 15 km/l
          money_saved_vs_petrol: distance_km ? (distance_km / 15) * 100 : 0 // ₹100/liter
        }
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}




