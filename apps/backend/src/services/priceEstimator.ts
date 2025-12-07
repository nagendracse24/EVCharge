/**
 * Price Estimation Service
 * 
 * Provides intelligent price estimates based on:
 * - Network (Tata, Statiq, Ather, etc.)
 * - Power level (AC vs DC)
 * - Location (metro vs non-metro)
 * - Time (peak vs off-peak)
 */

interface PriceEstimate {
  estimated_price: number
  min_price: number
  max_price: number
  confidence: 'high' | 'medium' | 'low'
  last_updated: string
  source: string
}

export class PriceEstimator {
  
  /**
   * Network-based pricing patterns (based on public information)
   * Source: Public pricing from operator websites, user reports, news articles
   */
  private networkPricing = {
    'Tata Power': {
      ac: { min: 12, avg: 14, max: 16 },
      dc: { min: 18, avg: 20, max: 22 }
    },
    'Statiq': {
      ac: { min: 10, avg: 12, max: 14 },
      dc: { min: 16, avg: 18, max: 20 }
    },
    'Ather Grid': {
      ac: { min: 8, avg: 10, max: 12 },
      dc: { min: 14, avg: 16, max: 18 }
    },
    'ChargeZone': {
      ac: { min: 11, avg: 13, max: 15 },
      dc: { min: 17, avg: 19, max: 21 }
    },
    'Fortum': {
      ac: { min: 13, avg: 15, max: 17 },
      dc: { min: 19, avg: 21, max: 23 }
    },
    'Default': {
      ac: { min: 10, avg: 12, max: 15 },
      dc: { min: 16, avg: 18, max: 22 }
    }
  }

  /**
   * Estimate price for a station
   */
  estimatePrice(
    network: string,
    powerKw: number,
    city: string,
    connectorType: string
  ): PriceEstimate {
    
    // Determine if AC or DC
    const isDC = powerKw >= 50 || connectorType.includes('CCS') || connectorType.includes('CHAdeMO')
    const chargeType = isDC ? 'dc' : 'ac'
    
    // Get network pricing or default
    const networkKey = Object.keys(this.networkPricing).find(key => 
      network?.toLowerCase().includes(key.toLowerCase())
    ) || 'Default'
    
    const pricing = this.networkPricing[networkKey as keyof typeof this.networkPricing][chargeType]
    
    // Metro city premium (slightly higher in major cities)
    const metroCities = ['bangalore', 'delhi', 'mumbai', 'chennai', 'hyderabad', 'pune', 'kolkata']
    const isMetro = metroCities.some(metro => city?.toLowerCase().includes(metro))
    const locationMultiplier = isMetro ? 1.05 : 0.95
    
    // Calculate final estimate
    const estimatedPrice = Math.round(pricing.avg * locationMultiplier * 100) / 100
    const minPrice = Math.round(pricing.min * locationMultiplier * 100) / 100
    const maxPrice = Math.round(pricing.max * locationMultiplier * 100) / 100
    
    // Confidence level
    const confidence = networkKey !== 'Default' ? 'high' : 'medium'
    
    return {
      estimated_price: estimatedPrice,
      min_price: minPrice,
      max_price: maxPrice,
      confidence,
      last_updated: new Date().toISOString(),
      source: 'estimated_from_network_averages'
    }
  }

  /**
   * Estimate busy hours based on typical EV charging patterns
   */
  estimateBusyHours(city: string): { 
    hour: number
    status: 'low' | 'medium' | 'high' | 'very_high'
    description: string 
  }[] {
    
    const schedule = []
    
    for (let hour = 0; hour < 24; hour++) {
      let status: 'low' | 'medium' | 'high' | 'very_high'
      let description: string
      
      // Morning rush (6-9 AM)
      if (hour >= 6 && hour <= 9) {
        status = 'very_high'
        description = 'Morning commute - Very busy'
      }
      // Lunch time (12-2 PM)
      else if (hour >= 12 && hour <= 14) {
        status = 'high'
        description = 'Lunch hours - Busy'
      }
      // Evening rush (5-9 PM)
      else if (hour >= 17 && hour <= 21) {
        status = 'very_high'
        description = 'Evening rush - Very busy'
      }
      // Mid-morning, mid-afternoon (9-12, 2-5 PM)
      else if ((hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17)) {
        status = 'medium'
        description = 'Moderate usage'
      }
      // Night and early morning (10 PM - 6 AM)
      else {
        status = 'low'
        description = 'Quiet time - Usually available'
      }
      
      schedule.push({ hour, status, description })
    }
    
    return schedule
  }

  /**
   * Get current busy status based on time
   */
  getCurrentBusyStatus(): {
    status: 'low' | 'medium' | 'high' | 'very_high'
    message: string
    recommendation: string
  } {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
    
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const schedule = this.estimateBusyHours('')[hour]
    
    let status = schedule.status
    let message = schedule.description
    
    // Weekend adjustment (slightly busier)
    if (isWeekend && status !== 'very_high') {
      if (status === 'medium') status = 'high'
      message += ' (Weekend)'
    }
    
    // Recommendation
    let recommendation = ''
    if (status === 'very_high') {
      recommendation = 'Consider charging during off-peak hours (10 PM - 6 AM) for shorter wait times'
    } else if (status === 'high') {
      recommendation = 'Moderate wait times expected. Best to book in advance if possible'
    } else if (status === 'medium') {
      recommendation = 'Good time to charge! Usually available within 15 minutes'
    } else {
      recommendation = 'Best time to charge! Stations typically available immediately'
    }
    
    return { status, message, recommendation }
  }

  /**
   * Calculate cost for charging session
   */
  calculateChargingCost(
    batteryCapacity: number,
    currentSoC: number,
    targetSoC: number,
    pricePerKwh: number,
    chargingEfficiency: number = 0.90 // 90% efficiency
  ): {
    energyNeeded: number
    estimatedCost: number
    estimatedTime: number // minutes
    powerKw: number
  } {
    
    // Energy needed (kWh)
    const socDelta = (targetSoC - currentSoC) / 100
    const energyNeeded = batteryCapacity * socDelta / chargingEfficiency
    
    // Cost
    const estimatedCost = Math.round(energyNeeded * pricePerKwh * 100) / 100
    
    // Time estimation (varies by power)
    // Assuming typical DC fast charging ~50kW, AC ~7kW
    const powerKw = pricePerKwh >= 16 ? 50 : 7.4
    const estimatedTime = Math.round((energyNeeded / powerKw) * 60)
    
    return {
      energyNeeded: Math.round(energyNeeded * 100) / 100,
      estimatedCost,
      estimatedTime,
      powerKw
    }
  }
}

// Singleton instance
export const priceEstimator = new PriceEstimator()


