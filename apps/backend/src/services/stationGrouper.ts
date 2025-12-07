// Station Grouping Service
// Groups nearby stations at the same location by network

interface StationData {
  id: string;
  name: string;
  network?: string;
  latitude: number;
  longitude: number;
  address: string;
  connectors: any[];
  pricing: any[];
  [key: string]: any;
}

interface GroupedStation {
  id: string; // Primary station ID
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  networks: Array<{
    network: string;
    stationId: string;
    connectors: any[];
    pricing: any[];
    station: StationData;
  }>;
  totalConnectors: number;
  distance_km?: number;
  [key: string]: any;
}

export class StationGrouper {
  // Distance threshold in meters (50m = same location)
  private static readonly DISTANCE_THRESHOLD = 50;

  /**
   * Calculate distance between two coordinates in meters
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Normalize station name (remove network prefix, trim, lowercase)
   */
  private static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/^(tata power|statiq|ather|ola|shell|hp|iocl)\s*-?\s*/i, '')
      .trim();
  }

  /**
   * Check if two stations are at the same location
   */
  private static isSameLocation(
    station1: StationData,
    station2: StationData
  ): boolean {
    // Check distance
    const distance = this.calculateDistance(
      station1.latitude,
      station1.longitude,
      station2.latitude,
      station2.longitude
    );

    if (distance > this.DISTANCE_THRESHOLD) {
      return false;
    }

    // Check name similarity
    const name1 = this.normalizeName(station1.name);
    const name2 = this.normalizeName(station2.name);

    // If names are similar or contain each other
    if (
      name1.includes(name2) ||
      name2.includes(name1) ||
      name1 === name2
    ) {
      return true;
    }

    // Check address similarity
    const addr1 = station1.address.toLowerCase();
    const addr2 = station2.address.toLowerCase();

    return addr1.includes(addr2) || addr2.includes(addr1);
  }

  /**
   * Group stations by location and network
   */
  public static groupStations(stations: StationData[]): GroupedStation[] {
    const grouped: GroupedStation[] = [];
    const processed = new Set<string>();

    for (const station of stations) {
      if (processed.has(station.id)) continue;

      // Find all stations at the same location
      const sameLocation = stations.filter(
        (s) =>
          !processed.has(s.id) &&
          this.isSameLocation(station, s)
      );

      // Create grouped station
      const groupedStation: GroupedStation = {
        id: station.id,
        name: this.getBestName(sameLocation),
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        city: station.city,
        state: station.state,
        pincode: station.pincode,
        is_24x7: station.is_24x7,
        parking_type: station.parking_type,
        distance_km: station.distance_km,
        avg_rating: station.avg_rating,
        review_count: station.review_count,
        networks: [],
        totalConnectors: 0,
      };

      // Group by network
      for (const s of sameLocation) {
        processed.add(s.id);
        
        const networkName = s.network || 'Independent';
        
        groupedStation.networks.push({
          network: networkName,
          stationId: s.id,
          connectors: s.connectors || [],
          pricing: s.pricing || [],
          station: s,
        });

        groupedStation.totalConnectors += (s.connectors || []).length;
      }

      // Sort networks by connector count (most first)
      groupedStation.networks.sort((a, b) => b.connectors.length - a.connectors.length);

      grouped.push(groupedStation);
    }

    return grouped;
  }

  /**
   * Get the best name from multiple stations (prefer branded names)
   */
  private static getBestName(stations: StationData[]): string {
    // Prefer names with brands
    const branded = stations.find((s) =>
      /marriott|hilton|taj|oberoi|hyatt|mall|airport|metro/i.test(s.name)
    );

    if (branded) return branded.name;

    // Otherwise, use the longest name (usually most descriptive)
    return stations.reduce((longest, current) =>
      current.name.length > longest.name.length ? current : longest
    ).name;
  }

  /**
   * Check if grouping is recommended (more than 1 station at same location)
   */
  public static shouldGroup(stations: StationData[]): boolean {
    if (stations.length < 2) return false;

    // Check if there are duplicates
    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
        if (this.isSameLocation(stations[i], stations[j])) {
          return true;
        }
      }
    }

    return false;
  }
}


