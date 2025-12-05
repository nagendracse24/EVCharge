import { FastifyPluginAsync } from 'fastify'
import { priceEstimator } from '../services/priceEstimator'

/**
 * Price estimation routes
 */
export const priceRoutes: FastifyPluginAsync = async (server) => {
  
  // Get price estimate for a station
  server.get('/estimate/:stationId', async (request, reply) => {
    const { stationId } = request.params as { stationId: string }
    const { powerKw, network, city, connectorType } = request.query as any
    
    try {
      const estimate = priceEstimator.estimatePrice(
        network || 'Unknown',
        parseFloat(powerKw) || 7.4,
        city || 'Bangalore',
        connectorType || 'Type 2'
      )
      
      return reply.send({ data: estimate })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })
  
  // Get busy hours prediction
  server.get('/busy-hours', async (request, reply) => {
    const { city } = request.query as { city?: string }
    
    try {
      const schedule = priceEstimator.estimateBusyHours(city || 'Bangalore')
      const currentStatus = priceEstimator.getCurrentBusyStatus()
      
      return reply.send({ 
        data: {
          schedule,
          current: currentStatus
        }
      })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })
  
  // Calculate charging cost
  server.post('/calculate-cost', async (request, reply) => {
    const {
      batteryCapacity,
      currentSoC,
      targetSoC,
      pricePerKwh
    } = request.body as {
      batteryCapacity: number
      currentSoC: number
      targetSoC: number
      pricePerKwh: number
    }
    
    try {
      const calculation = priceEstimator.calculateChargingCost(
        batteryCapacity,
        currentSoC,
        targetSoC,
        pricePerKwh
      )
      
      return reply.send({ data: calculation })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })
}

