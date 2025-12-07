# API Documentation

## Base URL
- **Production:** `https://evcharge-production.up.railway.app`
- **Development:** `http://localhost:3001`

## Authentication
Most endpoints require authentication via JWT token:
```
Authorization: Bearer <your_token>
```

## Endpoints

### Health Check
```http
GET /health
```

### Stations
```http
GET  /api/stations/nearby?lat={lat}&lng={lng}&radius_km={radius}&limit={limit}
GET  /api/stations/{id}
POST /api/stations (requires auth)
```

### Bookings
```http
GET  /api/bookings/slots/available?station_id={id}&connector_id={id}&date={date}&duration_minutes={minutes}
POST /api/bookings (requires auth)
GET  /api/bookings/user (requires auth)
```

### User & Favorites
```http
GET  /api/user/profile (requires auth)
GET  /api/favorites (requires auth)
POST /api/favorites (requires auth)
DELETE /api/favorites/{stationId} (requires auth)
```

### Reports
```http
POST /api/reports/price (requires auth)
POST /api/reports/availability (requires auth)
```

### Admin
```http
POST /api/admin/sync/openchargemap (requires admin)
POST /api/admin/sync/openstreetmap (requires admin)
GET  /api/admin/stats (requires admin)
```

## Response Format
All responses follow this structure:
```json
{
  "data": { ... },
  "meta": { ... }
}
```

## Error Handling
Errors return appropriate HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error


