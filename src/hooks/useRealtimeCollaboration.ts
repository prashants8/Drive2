import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { AuthUser } from '../types';

export function useRealtimeCollaboration(fileId: string, currentUser: AuthUser | null) {
  const [users, setUsers] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!fileId || !currentUser) return;

    const channel = supabase.channel(`file-collab:${fileId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const activeUsers = Object.values(newState).flat();
        setUsers(activeUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Optional: toast or logic for joined user
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Optional: toast or logic for left user
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        // Logic to track cursors
      })
      .on('broadcast', { event: 'edit' }, ({ payload }) => {
        setLastMessage(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            email: currentUser.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fileId, currentUser]);

  const broadcastEdit = (content: string) => {
    const channel = supabase.channel(`file-collab:${fileId}`);
    channel.send({
      type: 'broadcast',
      event: 'edit',
      payload: { content, user: currentUser?.email, timestamp: Date.now() },
    });
  };

  return { users, lastMessage, broadcastEdit };
}
