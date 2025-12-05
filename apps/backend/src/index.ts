import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { vehiclesRoutes } from './routes/vehicles';
import { stationsRoutes } from './routes/stations';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/users';
import { favoritesRoutes } from './routes/favorites';
import { adminRoutes } from './routes/admin';
import { bookingsRoutes } from './routes/bookings';
import { reportsRoutes } from './routes/reports';
import { priceRoutes } from './routes/price';
import { dataAggregator } from './services/dataAggregator';

const server = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function start() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: config.NODE_ENV === 'production' 
        ? /\.vercel\.app$/ // Allow all Vercel domains
        : true,
      credentials: true,
    });

    // Register routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(vehiclesRoutes, { prefix: '/api/vehicles' });
    await server.register(stationsRoutes, { prefix: '/api/stations' });
    await server.register(userRoutes, { prefix: '/api/user' });
    await server.register(favoritesRoutes);
    await server.register(adminRoutes, { prefix: '/api/admin' });
    await server.register(bookingsRoutes);
    await server.register(reportsRoutes, { prefix: '/api/reports' });
    await server.register(priceRoutes, { prefix: '/api/price' });

    // Start server
    const port = config.API_PORT;
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`💡 Frontend should connect to: http://localhost:${port}`);
    
    // Start auto-sync for data sources (production only)
    if (config.NODE_ENV === 'production') {
      console.log('🔄 Starting data aggregation auto-sync...')
      dataAggregator.startAutoSync()
    } else {
      console.log('💡 Data auto-sync disabled in development mode')
      console.log('💡 Use POST /api/admin/sync/all to manually sync data')
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

