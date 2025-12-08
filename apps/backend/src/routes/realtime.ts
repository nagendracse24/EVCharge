import { FastifyPluginAsync } from 'fastify';
import { supabase, supabaseAdmin } from '../db/supabase';
import { getRealtimeServer } from '../websocket/realtimeServer';

export const realtimeRoutes: FastifyPluginAsync = async (server) => {
  
  // POST /api/realtime/checkin - User checks in at a station
  server.post('/checkin', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    const { station_id, connector_id, status } = request.body as any;

    if (!station_id) {
      return reply.code(400).send({ error: 'station_id is required' });
    }

    try {
      // Create check-in
      const { data: checkin, error } = await supabaseAdmin
        .from('check_ins')
        .insert({
          user_id: user.id,
          station_id,
          connector_id: connector_id || null,
          status: status || 'arrived',
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast check-in via WebSocket
      const realtimeServer = getRealtimeServer();
      realtimeServer.broadcastCheckIn(station_id, {
        type: 'user_checked_in',
        userId: user.id,
        stationId: station_id,
        connectorId: connector_id,
        status: status || 'arrived',
        timestamp: new Date().toISOString(),
      });

      return reply.send({ data: checkin });
    } catch (error: any) {
      console.error('Check-in error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // PUT /api/realtime/checkin/:id - Update check-in status
  server.put('/checkin/:id', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    const { id } = request.params as any;
    const { status, energy_delivered_kwh } = request.body as any;

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'charging' && !updateData.charging_started_at) {
        updateData.charging_started_at = new Date().toISOString();
      }

      if (status === 'completed') {
        updateData.checked_out_at = new Date().toISOString();
        updateData.charging_ended_at = new Date().toISOString();
        if (energy_delivered_kwh) {
          updateData.energy_delivered_kwh = energy_delivered_kwh;
        }
      }

      const { data: checkin, error } = await supabaseAdmin
        .from('check_ins')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (!checkin) {
        return reply.code(404).send({ error: 'Check-in not found' });
      }

      // Broadcast update via WebSocket
      const realtimeServer = getRealtimeServer();
      realtimeServer.broadcastCheckIn(checkin.station_id, {
        type: 'checkin_updated',
        userId: user.id,
        stationId: checkin.station_id,
        status,
        timestamp: new Date().toISOString(),
      });

      return reply.send({ data: checkin });
    } catch (error: any) {
      console.error('Update check-in error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // GET /api/realtime/checkin/active - Get user's active check-in
  server.get('/checkin/active', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    try {
      const { data: checkin, error } = await supabase
        .from('check_ins')
        .select(`
          *,
          stations:station_id (
            id,
            name,
            address
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['arrived', 'charging'])
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      return reply.send({ data: checkin || null });
    } catch (error: any) {
      console.error('Get active check-in error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // POST /api/realtime/status - Report station status
  server.post('/status', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    const { station_id, connector_id, status } = request.body as any;

    if (!station_id || !status) {
      return reply.code(400).send({ error: 'station_id and status are required' });
    }

    try {
      // Create status report
      const { data: statusReport, error } = await supabaseAdmin
        .from('stations_status_live')
        .insert({
          station_id,
          connector_id: connector_id || null,
          status,
          reported_by: user.id,
          reported_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          confidence_score: 0.8, // User-reported gets high confidence
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast status update via WebSocket
      const realtimeServer = getRealtimeServer();
      realtimeServer.broadcastStatusUpdate(station_id, {
        type: 'status_reported',
        stationId: station_id,
        connectorId: connector_id,
        status,
        reportedBy: user.id,
        timestamp: new Date().toISOString(),
      });

      return reply.send({ data: statusReport });
    } catch (error: any) {
      console.error('Status report error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // GET /api/realtime/status/:stationId - Get live status for a station
  server.get('/status/:stationId', async (request, reply) => {
    const { stationId } = request.params as any;

    try {
      // Get aggregated status
      const { data: aggregation, error: aggError } = await supabase
        .from('status_aggregation')
        .select('*')
        .eq('station_id', stationId)
        .single();

      // Get active check-ins
      const { data: activeCheckins, error: checkinError } = await supabase
        .from('check_ins')
        .select('id, status, checked_in_at')
        .eq('station_id', stationId)
        .in('status', ['arrived', 'charging']);

      // Get recent status reports
      const { data: recentReports, error: reportsError } = await supabase
        .from('stations_status_live')
        .select('*')
        .eq('station_id', stationId)
        .gt('expires_at', new Date().toISOString())
        .order('reported_at', { ascending: false })
        .limit(10);

      return reply.send({
        data: {
          aggregation: aggregation || null,
          activeCheckins: activeCheckins || [],
          recentReports: recentReports || [],
        },
      });
    } catch (error: any) {
      console.error('Get status error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // GET /api/realtime/stats - Get WebSocket server stats (admin)
  server.get('/stats', async (request, reply) => {
    try {
      const realtimeServer = getRealtimeServer();
      const stats = realtimeServer.getStats();
      
      return reply.send({ data: stats });
    } catch (error: any) {
      console.error('Get stats error:', error);
      return reply.code(500).send({ error: error.message });
    }
  });
};





