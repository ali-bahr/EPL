// Native WebSocket for seat updates
let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let shouldReconnect = true; // Flag to control reconnection behavior
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export interface SeatData {
  id: string;
  rowNumber: number;
  seatNumber: number;
  isReserved: boolean;
}

export interface SeatGridResponse {
  items: SeatData[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function connectToMatchSeats(
  matchId: string, 
  onUpdate: (seats: SeatData[]) => void
): WebSocket {
  // Disconnect existing connection
  if (ws) {
    ws.close();
    ws = null;
  }

  // Enable reconnection
  shouldReconnect = true;

  // Determine protocol and host
  const host = import.meta.env.VITE_WS_HOST || 'golazo.runasp.net';
  
  // Use wss:// for production (golazo.runasp.net) and ws:// for localhost
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'ws:' : 'wss:';
  const wsUrl = `${protocol}//${host}/api/seats/live?matchId=${matchId}`;
  
  console.log('Connecting to WebSocket:', wsUrl);
  console.log('Using protocol:', protocol, 'for host:', host);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ CONNECTED to seat updates');
    reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    // Send ping as per backend expectation
    ws?.send('ping');
  };

  ws.onmessage = (event) => {
    console.log('📨 MESSAGE FROM SERVER:', event.data);
    try {
      const response = JSON.parse(event.data);
      
      // Handle both capitalized (Items) and lowercase (items) property names
      const items = response.Items || response.items;
      
      if (items && Array.isArray(items)) {
        // Map to consistent lowercase property names
        const seats: SeatData[] = items.map((item: any) => ({
          id: item.Id || item.id,
          rowNumber: item.RowNumber ?? item.rowNumber,
          seatNumber: item.SeatNumber ?? item.seatNumber,
          isReserved: item.IsReserved ?? item.isReserved
        }));
        
        console.log(`📊 Received ${seats.length} seats`);
        onUpdate(seats);
      }
    } catch (error) {
      console.error('❌ Failed to parse seat data:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('🔌 WebSocket closed:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      shouldReconnect,
      reconnectAttempts
    });
    
    // Only reconnect if:
    // 1. Reconnection is enabled (shouldReconnect = true)
    // 2. Haven't exceeded max reconnect attempts
    // 3. The close wasn't clean (server didn't explicitly close it)
    if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !event.wasClean) {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000); // Exponential backoff
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      reconnectTimeout = setTimeout(() => {
        console.log('🔄 Attempting reconnection...');
        connectToMatchSeats(matchId, onUpdate);
      }, delay);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Max reconnection attempts reached. Giving up.');
    } else if (event.wasClean) {
      console.log('✅ Clean disconnect - not reconnecting');
    }
  };

  return ws;
}

export function disconnectSocket() {
  console.log('🛑 Intentionally disconnecting WebSocket');
  
  // Disable reconnection
  shouldReconnect = false;
  reconnectAttempts = 0;
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (ws) {
    ws.close(1000, 'Client disconnect'); // 1000 = normal closure
    ws = null;
  }
}
