import { FastifyPluginAsync } from 'fastify';
import { supabase, supabaseAdmin } from '../db/supabase';
import {
  StationWithDetails,
  ApiResponse,
  calculateDistance,
  Vehicle,
  StationConnector,
} from '../types/shared';
import { z } from 'zod';
import { StationGrouper } from '../services/stationGrouper';

// Query schema for nearby stations
const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius_km: z.coerce.number().min(1).max(100).optional().default(10),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  vehicle_id: z.string().uuid().optional(),
  connector_type: z.string().optional(),
  is_dc_fast: z.coerce.boolean().optional(),
  network: z.string().optional(),
  sort_by: z.enum(['distance', 'price', 'rating', 'best']).optional().default('distance'),
  group_duplicates: z.coerce.boolean().optional().default(true), // NEW: Group stations at same location
});

type NearbyQuery = z.infer<typeof nearbyQuerySchema>;

// Schema for adding new station
const addStationSchema = z.object({
  name: z.string().min(3).max(200),
  network: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(10),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().optional(),
  is_24x7: z.boolean().optional().default(false),
  parking_type: z.string().optional(),
  connectors: z.array(z.object({
    connector_type: z.string(),
    power_kw: z.number().min(0),
    is_dc_fast: z.boolean(),
    count: z.number().int().min(1),
    vehicle_type_supported: z.enum(['2W', '4W', 'BOTH']),
  })).min(1),
  pricing: z.array(z.object({
    pricing_model: z.enum(['per_kwh', 'per_minute', 'flat_session']),
    price_value: z.number().min(0),
    parking_charges: z.number().optional(),
  })).optional(),
});

// Schema for reporting issues
const reportIssueSchema = z.object({
  report_type: z.enum(['offline', 'price_change', 'busy', 'incorrect_info', 'other']),
  value: z.string().optional(),
});

// Schema for adding review
const addReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const stationsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/stations/nearby - Get nearby stations
  server.get('/nearby', async (request, reply) => {
    try {
      const query = nearbyQuerySchema.parse(request.query);

      const { data: stationsData, error: stationsError } = await supabase.rpc(
        'get_nearby_stations',
        {
          user_lat: query.lat,
          user_lng: query.lng,
          radius_km: query.radius_km,
          result_limit: query.limit,
        }
      );

      if (stationsError) throw stationsError;

      if (!stationsData || stationsData.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            query_location: { lat: query.lat, lng: query.lng },
            radius_km: query.radius_km,
          },
        };
      }

      const stationIds = stationsData.map((s: any) => s.id);

      const [connectorsRes, pricingRes, amenitiesRes, reviewsRes] = await Promise.all([
        supabase.from('station_connectors').select('*').in('station_id', stationIds),
        supabase.from('station_pricing').select('*').in('station_id', stationIds),
        supabase.from('station_amenities').select('*').in('station_id', stationIds),
        supabase
          .from('station_reviews')
          .select('station_id, rating')
          .in('station_id', stationIds),
      ]);

      let userVehicle: Vehicle | null = null;
      if (query.vehicle_id) {
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', query.vehicle_id)
          .single();
        userVehicle = vehicleData;
      }

      const enrichedStations: StationWithDetails[] = stationsData.map((station: any) => {
        const connectors = connectorsRes.data?.filter((c) => c.station_id === station.id) || [];
        const pricing = pricingRes.data?.filter((p) => p.station_id === station.id) || [];
        const amenities = amenitiesRes.data?.find((a) => a.station_id === station.id);
        const stationReviews = reviewsRes.data?.filter((r) => r.station_id === station.id) || [];

        const avg_rating =
          stationReviews.length > 0
            ? stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length
            : undefined;

        let compatibility_status: 'compatible' | 'partial' | 'incompatible' | undefined;
        let estimated_cost: number | undefined;
        let estimated_charge_time_minutes: number | undefined;

        if (userVehicle && connectors.length > 0) {
          // Match EXACT connector type AND DC/AC type
          const hasFullCompatibility = connectors.some(
            (c: StationConnector) =>
              (c.connector_type === userVehicle.dc_connector_type && c.is_dc_fast === true) ||
              (c.connector_type === userVehicle.ac_connector_type && c.is_dc_fast === false)
          );

          const hasPartialCompatibility = connectors.some(
            (c: StationConnector) => 
              c.connector_type === userVehicle.ac_connector_type && c.is_dc_fast === false
          );

          compatibility_status = hasFullCompatibility
            ? 'compatible'
            : hasPartialCompatibility
            ? 'partial'
            : 'incompatible';

          if (pricing.length > 0 && pricing[0].pricing_model === 'per_kwh') {
            const energyNeeded = userVehicle.battery_capacity_kwh * 0.6;
            estimated_cost = energyNeeded * pricing[0].price_value;
          }

          const bestConnector = connectors
            .filter(
              (c: StationConnector) =>
                (c.connector_type === userVehicle.dc_connector_type && c.is_dc_fast === true) ||
                (c.connector_type === userVehicle.ac_connector_type && c.is_dc_fast === false)
            )
            .sort((a: StationConnector, b: StationConnector) => b.power_kw - a.power_kw)[0];

          if (bestConnector) {
            const energyNeeded = userVehicle.battery_capacity_kwh * 0.6;
            estimated_charge_time_minutes = (energyNeeded / (bestConnector.power_kw * 0.9)) * 60;
          }
        }

        return {
          ...station,
          connectors,
          pricing,
          amenities,
          avg_rating,
          total_reviews: stationReviews.length,
          compatibility_status,
          estimated_cost,
          estimated_charge_time_minutes,
        };
      });

      let filteredStations = enrichedStations;

      if (query.connector_type) {
        filteredStations = filteredStations.filter((s) =>
          s.connectors.some((c) => c.connector_type === query.connector_type)
        );
      }

      if (query.is_dc_fast !== undefined) {
        filteredStations = filteredStations.filter((s) =>
          s.connectors.some((c) => c.is_dc_fast === query.is_dc_fast)
        );
      }

      if (query.network) {
        filteredStations = filteredStations.filter((s) => s.network === query.network);
      }

      // Don't auto-filter by vehicle - just mark compatibility
      // Users can see all stations and make informed decisions
      // Vehicle filter is handled by frontend if user explicitly wants it

      if (query.sort_by === 'price' && filteredStations.some((s) => s.pricing.length > 0)) {
        filteredStations.sort((a, b) => {
          const priceA = a.pricing[0]?.price_value || Infinity;
          const priceB = b.pricing[0]?.price_value || Infinity;
          return priceA - priceB;
        });
      } else if (query.sort_by === 'rating') {
        filteredStations.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      } else if (query.sort_by === 'best') {
        filteredStations.sort((a, b) => {
          const scoreA =
            (a.trust_level || 50) / 100 +
            (a.avg_rating || 0) / 5 -
            (a.distance_km || 0) / query.radius_km;
          const scoreB =
            (b.trust_level || 50) / 100 +
            (b.avg_rating || 0) / 5 -
            (b.distance_km || 0) / query.radius_km;
          return scoreB - scoreA;
        });
      }

      // Group duplicate stations if requested
      let finalStations = filteredStations;
      let grouped = false;

      if (query.group_duplicates && StationGrouper.shouldGroup(filteredStations)) {
        const groupedStations = StationGrouper.groupStations(filteredStations);
        finalStations = groupedStations as any; // Type will be GroupedStation[]
        grouped = true;
      }

      return {
        data: finalStations,
        meta: {
          total: finalStations.length,
          query_location: { lat: query.lat, lng: query.lng },
          radius_km: query.radius_km,
          vehicle_id: query.vehicle_id,
          sort_by: query.sort_by,
          grouped, // Indicate if stations were grouped
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400);
        return {
          data: [],
          error: {
            message: 'Invalid query parameters',
            code: 'INVALID_QUERY',
          },
        };
      }

      server.log.error(error);
      reply.status(500);
      return {
        data: [],
        error: {
          message: 'Failed to fetch stations',
          code: 'STATIONS_FETCH_ERROR',
        },
      };
    }
  });

  // GET /api/stations/:id - Get station details (OPTIMIZED)
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const { data: station, error: stationError } = await supabase
        .from('stations')
        .select(`
          *,
          connectors:station_connectors(*),
          pricing:station_pricing(*),
          amenities:station_amenities(*),
          reviews:station_reviews(*, user_id)
        `)
        .eq('id', id)
        .single();

      if (stationError) throw stationError;

      if (!station) {
        reply.status(404);
        return {
          data: null,
          error: {
            message: 'Station not found',
            code: 'STATION_NOT_FOUND',
          },
        };
      }

      const reviews = station.reviews || [];
      const avg_rating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
          : undefined;

      const enrichedStation: StationWithDetails = {
        ...station,
        connectors: station.connectors || [],
        pricing: station.pricing || [],
        amenities: station.amenities?.[0] || undefined,
        reviews: reviews.slice(0, 10),
        avg_rating,
        total_reviews: reviews.length,
      };

      return {
        data: enrichedStation,
      };
    } catch (error) {
      server.log.error(error);
      reply.status(500);
      return {
        data: null,
        error: {
          message: 'Failed to fetch station details',
          code: 'STATION_DETAILS_ERROR',
        },
      };
    }
  });

  // POST /api/stations - Add new station (with auth)
  server.post('/', async (request, reply) => {
    try {
      // Get auth token
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        reply.status(401);
        return {
          data: null,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        };
      }

      const token = authHeader.substring(7);
      const { data: userData, error: authError } = await supabase.auth.getUser(token);

      if (authError || !userData.user) {
        reply.status(401);
        return {
          data: null,
          error: {
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED',
          },
        };
      }

      const body = addStationSchema.parse(request.body);

      // Insert station
      const { data: newStation, error: stationError } = await supabaseAdmin
        .from('stations')
        .insert({
          name: body.name,
          network: body.network,
          latitude: body.latitude,
          longitude: body.longitude,
          address: body.address,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          is_24x7: body.is_24x7,
          parking_type: body.parking_type,
          source: 'crowdsourced',
          trust_level: 50, // New user-submitted stations start at 50
        })
        .select()
        .single();

      if (stationError) throw stationError;

      // Insert connectors
      const connectorsToInsert = body.connectors.map((c) => ({
        station_id: newStation.id,
        ...c,
      }));

      await supabaseAdmin.from('station_connectors').insert(connectorsToInsert);

      // Insert pricing if provided
      if (body.pricing && body.pricing.length > 0) {
        const pricingToInsert = body.pricing.map((p) => ({
          station_id: newStation.id,
          ...p,
        }));
        await supabaseAdmin.from('station_pricing').insert(pricingToInsert);
      }

      reply.status(201);
      return {
        data: newStation,
        meta: {
          message: 'Station added successfully! It will be reviewed by our team.',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400);
        return {
          data: null,
          error: {
            message: 'Invalid station data',
            code: 'INVALID_DATA',
          },
        };
      }

      server.log.error(error);
      reply.status(500);
      return {
        data: null,
        error: {
          message: 'Failed to add station',
          code: 'ADD_STATION_ERROR',
        },
      };
    }
  });

  // POST /api/stations/:id/report - Report issue with station
  server.post<{ Params: { id: string } }>('/:id/report', async (request, reply) => {
    try {
      const { id } = request.params;

      // Optional auth - can report without login
      let userId = null;
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData.user?.id || null;
      }

      const body = reportIssueSchema.parse(request.body);

      const { data, error } = await supabaseAdmin
        .from('station_reports')
        .insert({
          station_id: id,
          user_id: userId,
          report_type: body.report_type,
          value: body.value,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      reply.status(201);
      return {
        data,
        meta: {
          message: 'Report submitted successfully!',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400);
        return {
          data: null,
          error: {
            message: 'Invalid report data',
            code: 'INVALID_DATA',
          },
        };
      }

      server.log.error(error);
      reply.status(500);
      return {
        data: null,
        error: {
          message: 'Failed to submit report',
          code: 'REPORT_ERROR',
        },
      };
    }
  });

  // POST /api/stations/:id/review - Add review (requires auth)
  server.post<{ Params: { id: string } }>('/:id/review', async (request, reply) => {
    try {
      const { id } = request.params;

      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        reply.status(401);
        return {
          data: null,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        };
      }

      const token = authHeader.substring(7);
      const { data: userData, error: authError } = await supabase.auth.getUser(token);

      if (authError || !userData.user) {
        reply.status(401);
        return {
          data: null,
          error: {
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED',
          },
        };
      }

      const body = addReviewSchema.parse(request.body);

      const { data, error } = await supabaseAdmin
        .from('station_reviews')
        .insert({
          station_id: id,
          user_id: userData.user.id,
          rating: body.rating,
          comment: body.comment,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          reply.status(409);
          return {
            data: null,
            error: {
              message: 'You have already reviewed this station',
              code: 'DUPLICATE_REVIEW',
            },
          };
        }
        throw error;
      }

      reply.status(201);
      return {
        data,
        meta: {
          message: 'Review added successfully!',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400);
        return {
          data: null,
          error: {
            message: 'Invalid review data',
            code: 'INVALID_DATA',
          },
        };
      }

      server.log.error(error);
      reply.status(500);
      return {
        data: null,
        error: {
          message: 'Failed to add review',
          code: 'REVIEW_ERROR',
        },
      };
    }
  });

  // GET /api/stations/city/:city - Get stations by city
  server.get<{ Params: { city: string } }>('/city/:city', async (request, reply) => {
    try {
      const { city } = request.params;

      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .ilike('city', city)
        .order('trust_level', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        meta: {
          total: data?.length || 0,
          city,
        },
      };
    } catch (error) {
      server.log.error(error);
      reply.status(500);
      return {
        data: [],
        error: {
          message: 'Failed to fetch stations',
          code: 'STATIONS_FETCH_ERROR',
        },
      };
    }
  });
};
