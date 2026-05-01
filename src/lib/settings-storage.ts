/**
 * Settings Storage
 * Handles persistence of user settings to IndexedDB with migration support.
 *
 * Previously used localStorage — replaced with IndexedDB for async,
 * non-blocking I/O and larger storage capacity.
 */

import type { Settings, ModelId } from './types';
import { idbGet, idbSet, idbRemove, isIDBAvailable } from './indexed-db';

const SETTINGS_KEY = 'SOHAM-settings';
const SETTINGS_VERSION = 2; // Increment when schema changes

interface StoredSettings extends Settings {
  _version?: number;
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  model: 'auto',
  preferredCategory: undefined,
  tone: 'helpful',
  technicalLevel: 'intermediate',
  responseFontWeight: 'regular',
  enableSpeech: false,
  voice: 'troy',
};

// Valid model IDs for validation (from models-config.json)
import modelsConfigData from './models-config.json';
const VALID_MODEL_IDS: Set<string> = new Set([
  'auto',
  ...modelsConfigData.models.filter((m: any) => m.enabled).map((m: any) => m.id),
]);

// Legacy model ID migrations
const MODEL_MIGRATIONS: Record<string, ModelId> = {};

// ── Migration ──────────────────────────────────────────────────────────────────

function migrateSettings(stored: StoredSettings): Settings {
  const version = stored._version || 1;
  let settings: Settings = { ...DEFAULT_SETTINGS, ...stored };

  if (version < 2) {
    if (settings.model !== 'auto') {
      const migratedModel = MODEL_MIGRATIONS[settings.model];
      if (migratedModel) {
        settings.model = migratedModel;
      } else if (!VALID_MODEL_IDS.has(settings.model)) {
        settings.model = 'auto';
      }
    }
    if (!settings.preferredCategory) {
      settings.preferredCategory = undefined;
    }
  }

  if (!settings.responseFontWeight) {
    settings.responseFontWeight = DEFAULT_SETTINGS.responseFontWeight;
  }

  return settings;
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validateSettings(settings: unknown): settings is Settings {
  if (!settings || typeof settings !== 'object') return false;

  const s = settings as Record<string, unknown>;

  if (typeof s.model !== 'string' || !VALID_MODEL_IDS.has(s.model)) return false;
  if (!['helpful', 'formal', 'casual'].includes(s.tone as string)) return false;
  if (!['beginner', 'intermediate', 'expert'].includes(s.technicalLevel as string)) return false;
  if (
    s.responseFontWeight !== undefined &&
    !['regular', 'medium', 'bold'].includes(s.responseFontWeight as string)
  ) {
    return false;
  }
  if (typeof s.enableSpeech !== 'boolean') return false;
  if (!['troy', 'diana', 'hannah', 'autumn', 'austin', 'daniel'].includes(s.voice as string)) {
    return false;
  }

  return true;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Load settings from IndexedDB.
 * Returns DEFAULT_SETTINGS when running on the server or when no value is stored.
 */
export async function loadSettings(): Promise<Settings> {
  if (!isIDBAvailable()) return DEFAULT_SETTINGS;

  try {
    const stored = await idbGet<StoredSettings>(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const migrated = migrateSettings(stored);
    return validateSettings(migrated) ? migrated : DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('[settings-storage] Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to IndexedDB.
 */
export async function saveSettings(settings: Settings): Promise<void> {
  if (!isIDBAvailable()) return;

  try {
    const toStore: StoredSettings = { ...settings, _version: SETTINGS_VERSION };
    await idbSet(SETTINGS_KEY, toStore);
  } catch (error) {
    console.warn('[settings-storage] Failed to save settings:', error);
  }
}

/**
 * Remove settings from IndexedDB.
 */
export async function clearSettings(): Promise<void> {
  if (!isIDBAvailable()) return;

  try {
    await idbRemove(SETTINGS_KEY);
  } catch (error) {
    console.warn('[settings-storage] Failed to clear settings:', error);
  }
}

/**
 * Check whether a model ID is valid.
 */
export function isValidModelId(modelId: string): modelId is 'auto' | ModelId {
  return VALID_MODEL_IDS.has(modelId);
}
