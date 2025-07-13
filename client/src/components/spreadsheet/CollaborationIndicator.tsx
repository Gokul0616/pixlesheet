import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

interface CollaborationIndicatorProps {
  spreadsheetId: number;
  currentUserId?: string;
}

interface ConnectedUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: {
    row: number;
    column: number;
  };
}

export function CollaborationIndicator({ spreadsheetId, currentUserId }: CollaborationIndicatorProps) {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for user presence updates
    const handleUserJoined = (data: any) => {
      setConnectedUsers(prev => {
        const existing = prev.find(user => user.id === data.user.id);
        if (existing) return prev;
        return [...prev, data.user];
      });
    };

    const handleUserLeft = (data: any) => {
      setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
    };

    const handleCursorMove = (data: any) => {
      if (data.userId === currentUserId) return;
      
      setConnectedUsers(prev => 
        prev.map(user => 
          user.id === data.userId 
            ? { ...user, cursor: { row: data.row, column: data.column } }
            : user
        )
      );
    };

    const handleUserTyping = (data: any) => {
      if (data.userId === currentUserId) return;
      
      setConnectedUsers(prev => 
        prev.map(user => 
          user.id === data.userId 
            ? { ...user, cursor: { row: data.row, column: data.column } }
            : user
        )
      );
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('cursor_move', handleCursorMove);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('cursor_move', handleCursorMove);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, currentUserId]);

  const getColumnLetter = (col: number) => {
    let result = "";
    while (col > 0) {
      col--;
      result = String.fromCharCode(65 + (col % 26)) + result;
      col = Math.floor(col / 26);
    }
    return result;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Render cursors for other users */}
      {connectedUsers.map(user => (
        user.cursor && (
          <div
            key={user.id}
            className="absolute flex items-center pointer-events-none"
            style={{
              left: `${40 + (user.cursor.column - 1) * 120}px`,
              top: `${32 + (user.cursor.row - 1) * 32}px`,
              transform: 'translate(-1px, -1px)'
            }}
          >
            {/* Cursor indicator */}
            <div
              className="w-0.5 h-6 animate-pulse"
              style={{ backgroundColor: user.color }}
            />
            
            {/* User name badge */}
            <div
              className="ml-1 px-2 py-1 rounded text-xs text-white font-medium shadow-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        )
      ))}
      
      {/* User presence indicators in top-right */}
      <div className="absolute top-2 right-2 flex items-center space-x-2 pointer-events-auto">
        {/* Connection status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {/* Connected users */}
        {connectedUsers.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">
              {connectedUsers.length} {connectedUsers.length === 1 ? 'user' : 'users'} online
            </span>
            <div className="flex -space-x-1">
              {connectedUsers.slice(0, 3).map(user => (
                <div
                  key={user.id}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {connectedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs text-white">
                  +{connectedUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}