// WebSocket Server for Real-time Updates
import { FastifyInstance } from 'fastify';
import { WebSocketServer, WebSocket } from 'ws';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  subscribedStations: Set<string>;
}

export class RealtimeServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private stationSubscriptions: Map<string, Set<WebSocketClient>> = new Map();

  constructor(server: FastifyInstance) {
    this.wss = new WebSocketServer({ noServer: true });
    
    // Upgrade HTTP to WebSocket
    server.server.on('upgrade', (request, socket, head) => {
      if (request.url?.startsWith('/ws')) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      }
    });

    this.setupWebSocket();
    this.setupHeartbeat();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocketClient, request) => {
      const clientId = this.generateClientId();
      ws.isAlive = true;
      ws.subscribedStations = new Set();
      
      this.clients.set(clientId, ws);
      
      console.log(`📡 Client connected: ${clientId} (Total: ${this.clients.size})`);

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        clientId,
        message: 'Connected to EVCharge real-time server',
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, clientId, message);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });

      // Handle pong (heartbeat)
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });
    });
  }

  private setupHeartbeat() {
    // Ping clients every 30 seconds
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          console.log('Terminating dead connection');
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleMessage(ws: WebSocketClient, clientId: string, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'auth':
        // Authenticate user
        ws.userId = data.userId;
        console.log(`🔐 Client ${clientId} authenticated as ${data.userId}`);
        this.send(ws, { type: 'auth_success', userId: data.userId });
        break;

      case 'subscribe':
        // Subscribe to station updates
        if (data.stationId) {
          this.subscribeToStation(ws, data.stationId);
        }
        break;

      case 'unsubscribe':
        // Unsubscribe from station updates
        if (data.stationId) {
          this.unsubscribeFromStation(ws, data.stationId);
        }
        break;

      case 'status_update':
        // Broadcast status update to all subscribers
        if (data.stationId) {
          this.broadcastStatusUpdate(data.stationId, data);
        }
        break;

      case 'checkin':
        // Broadcast check-in to subscribers
        if (data.stationId) {
          this.broadcastCheckIn(data.stationId, data);
        }
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }

  private subscribeToStation(ws: WebSocketClient, stationId: string) {
    ws.subscribedStations.add(stationId);
    
    if (!this.stationSubscriptions.has(stationId)) {
      this.stationSubscriptions.set(stationId, new Set());
    }
    
    this.stationSubscriptions.get(stationId)!.add(ws);
    
    console.log(`📍 Client subscribed to station ${stationId} (${this.stationSubscriptions.get(stationId)!.size} subscribers)`);
    
    this.send(ws, {
      type: 'subscribed',
      stationId,
    });
  }

  private unsubscribeFromStation(ws: WebSocketClient, stationId: string) {
    ws.subscribedStations.delete(stationId);
    
    const subscribers = this.stationSubscriptions.get(stationId);
    if (subscribers) {
      subscribers.delete(ws);
      
      if (subscribers.size === 0) {
        this.stationSubscriptions.delete(stationId);
      }
    }
    
    console.log(`📍 Client unsubscribed from station ${stationId}`);
  }

  private handleDisconnect(clientId: string) {
    const ws = this.clients.get(clientId);
    
    if (ws) {
      // Unsubscribe from all stations
      ws.subscribedStations.forEach((stationId) => {
        this.unsubscribeFromStation(ws, stationId);
      });
      
      this.clients.delete(clientId);
    }
    
    console.log(`📡 Client disconnected: ${clientId} (Total: ${this.clients.size})`);
  }

  // Public methods for broadcasting updates

  public broadcastStatusUpdate(stationId: string, data: any) {
    const subscribers = this.stationSubscriptions.get(stationId);
    
    if (subscribers && subscribers.size > 0) {
      const message = {
        type: 'status_update',
        stationId,
        data,
        timestamp: new Date().toISOString(),
      };
      
      subscribers.forEach((client) => {
        this.send(client, message);
      });
      
      console.log(`📢 Broadcasted status update to ${subscribers.size} subscribers for station ${stationId}`);
    }
  }

  public broadcastCheckIn(stationId: string, data: any) {
    const subscribers = this.stationSubscriptions.get(stationId);
    
    if (subscribers && subscribers.size > 0) {
      const message = {
        type: 'checkin',
        stationId,
        data,
        timestamp: new Date().toISOString(),
      };
      
      subscribers.forEach((client) => {
        this.send(client, message);
      });
      
      console.log(`📢 Broadcasted check-in to ${subscribers.size} subscribers for station ${stationId}`);
    }
  }

  public broadcastToAll(message: any) {
    this.clients.forEach((client) => {
      this.send(client, message);
    });
  }

  // Helper methods

  private send(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get server stats
  public getStats() {
    return {
      totalClients: this.clients.size,
      totalStationSubscriptions: this.stationSubscriptions.size,
      stationSubscribers: Array.from(this.stationSubscriptions.entries()).map(
        ([stationId, subscribers]) => ({
          stationId,
          subscribers: subscribers.size,
        })
      ),
    };
  }

  // Close all connections
  public close() {
    this.wss.clients.forEach((client) => {
      client.close();
    });
    this.wss.close();
    console.log('🔌 WebSocket server closed');
  }
}

// Singleton instance
let realtimeServer: RealtimeServer | null = null;

export function initializeRealtimeServer(server: FastifyInstance): RealtimeServer {
  if (!realtimeServer) {
    realtimeServer = new RealtimeServer(server);
    console.log('✅ Real-time WebSocket server initialized');
  }
  return realtimeServer;
}

export function getRealtimeServer(): RealtimeServer {
  if (!realtimeServer) {
    throw new Error('Real-time server not initialized');
  }
  return realtimeServer;
}





