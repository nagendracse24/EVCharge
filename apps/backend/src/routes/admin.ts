import { FastifyInstance } from 'fastify'
import { dataAggregator } from '../services/dataAggregator'
import { supabase } from '../db/supabase'

export async function adminRoutes(server: FastifyInstance) {
  // GET /sync/status - Get sync status for all sources
  server.get('/sync/status', async (request, reply) => {
    try {
      // Get recent sync logs
      const { data: logs, error } = await supabase
        .from('data_sync_logs')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Group by source
      const statusBySource: Record<string, any> = {}

      for (const log of logs || []) {
        if (!statusBySource[log.source_id]) {
          statusBySource[log.source_id] = {
            source_id: log.source_id,
            last_sync_at: log.synced_at,
            total_inserted: 0,
            total_updated: 0,
            total_errors: 0,
            recent_syncs: [],
          }
        }

        statusBySource[log.source_id].total_inserted += log.inserted_count
        statusBySource[log.source_id].total_updated += log.updated_count
        statusBySource[log.source_id].total_errors += log.error_count

        if (statusBySource[log.source_id].recent_syncs.length < 5) {
          statusBySource[log.source_id].recent_syncs.push({
            synced_at: log.synced_at,
            inserted: log.inserted_count,
            updated: log.updated_count,
            errors: log.error_count,
            duration: log.duration_seconds,
          })
        }
      }

      return reply.send({
        data: Object.values(statusBySource),
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /sync/:sourceId - Manually trigger sync for a source
  server.post<{ Params: { sourceId: string } }>(
    '/sync/:sourceId',
    async (request, reply) => {
      const { sourceId } = request.params

      try {
        const result = await dataAggregator.syncSource(sourceId)
        return reply.send({
          data: {
            source_id: sourceId,
            ...result,
          },
        })
      } catch (error: any) {
        server.log.error(error)
        return reply.code(500).send({ error: { message: error.message } })
      }
    }
  )

  // POST /sync/all - Sync all sources
  server.post('/sync/all', async (request, reply) => {
    try {
      // Run in background
      dataAggregator.syncAll().catch(err => {
        server.log.error('Background sync failed:', err)
      })

      return reply.send({
        data: {
          message: 'Sync started in background',
        },
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // GET /stats - Get database stats
  server.get('/stats', async (request, reply) => {
    try {
      // Count stations by source
      const { data: stationsBySource, error: e1 } = await supabase
        .from('stations')
        .select('source')
        .order('source')

      const sourceCount: Record<string, number> = {}
      for (const s of stationsBySource || []) {
        sourceCount[s.source] = (sourceCount[s.source] || 0) + 1
      }

      // Count total stations
      const { count: totalStations, error: e2 } = await supabase
        .from('stations')
        .select('*', { count: 'exact', head: true })

      // Count total connectors
      const { count: totalConnectors, error: e3 } = await supabase
        .from('station_connectors')
        .select('*', { count: 'exact', head: true })

      // Count total reviews
      const { count: totalReviews, error: e4 } = await supabase
        .from('station_reviews')
        .select('*', { count: 'exact', head: true })

      if (e1 || e2 || e3 || e4) {
        throw e1 || e2 || e3 || e4
      }

      return reply.send({
        data: {
          total_stations: totalStations || 0,
          total_connectors: totalConnectors || 0,
          total_reviews: totalReviews || 0,
          stations_by_source: sourceCount,
        },
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}



