import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'

export async function rewardsRoutes(server: FastifyInstance) {
  
  // Get user's rewards profile
  server.get('/api/rewards/profile', async (request, reply) => {
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

      const { data: rewards, error } = await supabaseAdmin
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Create if doesn't exist
        const { data: newRewards } = await supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: user.id,
            referral_code: generateReferralCode()
          })
          .select()
          .single()
        
        return reply.send({ data: newRewards })
      }

      return reply.send({ data: rewards })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Get rewards transactions history
  server.get('/api/rewards/transactions', async (request, reply) => {
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

      const { data: transactions, error } = await supabaseAdmin
        .from('rewards_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return reply.send({ data: transactions || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Get leaderboard
  server.get('/api/rewards/leaderboard', async (request, reply) => {
    const { limit = 10 } = request.query as { limit?: number }

    try {
      const { data: leaderboard, error } = await supabaseAdmin
        .from('user_rewards')
        .select(`
          *,
          user:auth.users(email)
        `)
        .order('total_points', { ascending: false })
        .limit(Math.min(limit, 100))

      if (error) throw error

      // Anonymize for privacy
      const anonymized = leaderboard?.map((entry, index) => ({
        rank: index + 1,
        username: entry.user?.email?.split('@')[0] || 'Anonymous',
        total_points: entry.total_points,
        current_level: entry.current_level,
        total_sessions: entry.total_sessions,
        total_carbon_saved_kg: entry.total_carbon_saved_kg
      }))

      return reply.send({ data: anonymized })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // Redeem points
  server.post('/api/rewards/redeem', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { points, reward_type, description } = request.body as {
      points: number
      reward_type: string
      description?: string
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Get current points
      const { data: rewards } = await supabaseAdmin
        .from('user_rewards')
        .select('total_points')
        .eq('user_id', user.id)
        .single()

      if (!rewards || rewards.total_points < points) {
        return reply.code(400).send({ error: { message: 'Insufficient points' } })
      }

      // Deduct points
      const { error: updateError } = await supabaseAdmin
        .from('user_rewards')
        .update({ 
          total_points: rewards.total_points - points,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Create transaction
      await supabaseAdmin
        .from('rewards_transactions')
        .insert({
          user_id: user.id,
          points_change: -points,
          transaction_type: 'redeem',
          description: description || `Redeemed ${points} points for ${reward_type}`
        })

      return reply.send({ success: true, points_redeemed: points })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}




