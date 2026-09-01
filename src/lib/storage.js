/**
 * Offline-First Local Storage & IndexedDB Synchronization Manager
 */

const DB_NAME = 'CricUmpireDB';
const DB_VERSION = 1;
const STORE_MATCHES = 'matches';
const STORE_LOGS = 'audit_logs';
const STORE_QUEUE = 'sync_queue';

class StorageManager {
  constructor() {
    this.db = null;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners = new Set();
    this.syncListeners = new Set();
    this.initNetworkListeners();
    this.initDB();
  }

  initNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyNetworkChange();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyNetworkChange();
      });
    }
  }

  subscribeNetwork(callback) {
    this.listeners.add(callback);
    callback(this.isOnline);
    return () => this.listeners.delete(callback);
  }

  notifyNetworkChange() {
    this.listeners.forEach((cb) => cb(this.isOnline));
  }

  subscribeSync(callback) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  notifySyncStatus(status, message = '') {
    this.syncListeners.forEach((cb) => cb({ status, message, timestamp: Date.now() }));
  }

  async initDB() {
    if (typeof indexedDB === 'undefined') return null;
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_MATCHES)) {
            db.createObjectStore(STORE_MATCHES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_LOGS)) {
            db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_QUEUE)) {
            db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
          }
        };
        request.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };
        request.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  // Save match state locally
  async saveMatch(match) {
    if (!match || !match.id) return;
    try {
      // 1. Save to LocalStorage for instant synchronous hydration
      localStorage.setItem(`cric_match_${match.id}`, JSON.stringify(match));
      
      // Update match list index in localStorage
      const matchIndex = this.getMatchListIndex();
      const existing = matchIndex.findIndex(m => m.id === match.id);
      const summary = {
        id: match.id,
        name: `${match.teamA.name} vs ${match.teamB.name}`,
        teamA: match.teamA.name,
        teamB: match.teamB.name,
        overs: match.totalOvers,
        status: match.status,
        date: match.createdAt || new Date().toISOString(),
        updatedAt: Date.now(),
        format: match.format || 'T20',
        venue: match.venue || 'Main Oval',
      };

      if (existing >= 0) {
        matchIndex[existing] = summary;
      } else {
        matchIndex.unshift(summary);
      }
      localStorage.setItem('cric_matches_index', JSON.stringify(matchIndex));

      // 2. Save to IndexedDB
      if (this.db) {
        const tx = this.db.transaction([STORE_MATCHES], 'readwrite');
        const store = tx.objectStore(STORE_MATCHES);
        store.put(match);
      }
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
  }

  getMatch(matchId) {
    try {
      const data = localStorage.getItem(`cric_match_${matchId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getMatchListIndex() {
    try {
      const data = localStorage.getItem('cric_matches_index');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  deleteMatch(matchId) {
    try {
      localStorage.removeItem(`cric_match_${matchId}`);
      const matchIndex = this.getMatchListIndex().filter(m => m.id !== matchId);
      localStorage.setItem('cric_matches_index', JSON.stringify(matchIndex));

      if (this.db) {
        const tx = this.db.transaction([STORE_MATCHES], 'readwrite');
        const store = tx.objectStore(STORE_MATCHES);
        store.delete(matchId);
      }
    } catch (err) {
      console.warn('Delete match failed:', err);
    }
  }

  // Audit Logs Persistence
  saveAuditLog(matchId, logEntry) {
    try {
      const key = `cric_logs_${matchId}`;
      const existing = this.getAuditLogs(matchId);
      const entry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        matchId,
        timestamp: Date.now(),
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: logEntry.user || 'Umpire',
        action: logEntry.action,
        type: logEntry.type || 'score', // 'score', 'wicket', 'extra', 'undo', 'edit', 'sync', 'system'
        details: logEntry.details || '',
      };
      existing.unshift(entry);
      // Keep last 300 logs
      if (existing.length > 300) existing.pop();
      localStorage.setItem(key, JSON.stringify(existing));
      return entry;
    } catch {
      return null;
    }
  }

  getAuditLogs(matchId) {
    try {
      const key = `cric_logs_${matchId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // App Settings Persistence (theme, sound, speech, contrast)
  getSettings() {
    try {
      const data = localStorage.getItem('cric_settings');
      return data ? JSON.parse(data) : {
        soundEnabled: true,
        hapticsEnabled: true,
        highContrast: false,
        voiceEnabled: true,
        scorerName: 'Umpire In-Charge',
        scorerRole: 'Lead Umpire',
        theme: 'dark',
      };
    } catch {
      return { soundEnabled: true, hapticsEnabled: true, highContrast: false, voiceEnabled: true, scorerName: 'Umpire', scorerRole: 'Lead Umpire', theme: 'dark' };
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem('cric_settings', JSON.stringify(settings));
    } catch {
      // storage error
    }
  }
}

export const storage = new StorageManager();
