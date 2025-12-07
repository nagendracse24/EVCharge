// WebSocket Client for Real-time Updates
import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:3001';

interface WebSocketMessage {
  type: string;
  data?: any;
  stationId?: string;
  timestamp?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnect = true,
    reconnectInterval = 5000,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      console.log('📡 Connecting to WebSocket:', `${WS_URL}/ws`);
      
      ws.current = new WebSocket(`${WS_URL}/ws`);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('Connection error');
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnect) {
          reconnectTimeout.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect');
    }
  }, [onMessage, onConnect, onDisconnect, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  const subscribe = useCallback((stationId: string) => {
    return send({
      type: 'subscribe',
      data: { stationId },
    });
  }, [send]);

  const unsubscribe = useCallback((stationId: string) => {
    return send({
      type: 'unsubscribe',
      data: { stationId },
    });
  }, [send]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    send,
    subscribe,
    unsubscribe,
    reconnect: connect,
  };
}

// Hook for station-specific real-time updates
export function useStationRealtime(stationId: string | null) {
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [activeCheckins, setActiveCheckins] = useState<number>(0);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.stationId === stationId) {
      switch (message.type) {
        case 'status_update':
          setLiveStatus(message.data);
          break;
        case 'checkin':
          if (message.data.type === 'user_checked_in') {
            setActiveCheckins((prev) => prev + 1);
          }
          break;
      }
    }
  }, [stationId]);

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (stationId && isConnected) {
      subscribe(stationId);
      return () => {
        unsubscribe(stationId);
      };
    }
  }, [stationId, isConnected, subscribe, unsubscribe]);

  return {
    liveStatus,
    activeCheckins,
    isConnected,
  };
}


