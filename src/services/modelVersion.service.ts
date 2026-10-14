import { getActiveModelVersion } from '@/data/modelVersions'
import { ModelSnapshot } from '@/types/modelVersion'
import { DEFAULT_MODEL_PARAMS, MODEL_VERSION } from '@statbarn/prediction-core'

// The model every prediction and Elo update should use. Falls back to the
// code default so the app keeps working before any version is stored.
export async function getActiveModel(): Promise<ModelSnapshot> {
  const active = await getActiveModelVersion()
  if (active) return { version: active.version, params: active.params }

  console.warn(
    `No active model version in the database; using built-in ${MODEL_VERSION}`
  )
  return { version: MODEL_VERSION, params: DEFAULT_MODEL_PARAMS }
}
