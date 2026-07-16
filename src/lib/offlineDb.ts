// Client-side Offline-First Sync Database wrapper

// Check if window is defined (for SSR safety)
const isBrowser = typeof window !== "undefined";

export const getOnlineStatus = (): boolean => {
  if (!isBrowser) return true;
  return navigator.onLine;
};

// Queue for actions that need to sync when online
interface SyncAction {
  id: string;
  url: string;
  method: "POST" | "PUT" | "DELETE";
  body: any;
  timestamp: number;
}

const getSyncQueue = (): SyncAction[] => {
  if (!isBrowser) return [];
  const queue = localStorage.getItem("voyana_sync_queue");
  return queue ? JSON.parse(queue) : [];
};

const saveSyncQueue = (queue: SyncAction[]) => {
  if (!isBrowser) return;
  localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
};

export const addToSyncQueue = (url: string, method: SyncAction["method"], body: any) => {
  if (!isBrowser) return;
  const queue = getSyncQueue();
  const newAction: SyncAction = {
    id: Math.random().toString(36).substring(2, 9),
    url,
    method,
    body,
    timestamp: Date.now(),
  };
  queue.push(newAction);
  saveSyncQueue(queue);
  console.log("Added action to offline sync queue:", newAction);
};

// Process offline sync queue
export const processSyncQueue = async (token: string): Promise<{ success: boolean; syncedCount: number }> => {
  if (!isBrowser || !getOnlineStatus()) return { success: false, syncedCount: 0 };
  const queue = getSyncQueue();
  if (queue.length === 0) return { success: true, syncedCount: 0 };

  console.log(`Processing offline sync queue: ${queue.length} actions pending.`);
  let successCount = 0;

  for (const action of queue) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(action.body),
      });

      if (response.ok) {
        successCount++;
      } else {
        console.error(`Failed to sync action ${action.id} to ${action.url}:`, await response.text());
      }
    } catch (err) {
      console.error(`Network error syncing action ${action.id}:`, err);
      break; // Stop processing queue if network is still down/unstable
    }
  }

  // Remove successfully synced actions
  const remainingQueue = getSyncQueue().slice(successCount);
  saveSyncQueue(remainingQueue);

  return {
    success: remainingQueue.length === 0,
    syncedCount: successCount,
  };
};

// Local storage accessors for when offline
export const getLocalData = (key: string, defaultValue: any = null): any => {
  if (!isBrowser) return defaultValue;
  const data = localStorage.getItem(`voyana_local_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

export const saveLocalData = (key: string, data: any) => {
  if (!isBrowser) return;
  localStorage.setItem(`voyana_local_${key}`, JSON.stringify(data));
};
