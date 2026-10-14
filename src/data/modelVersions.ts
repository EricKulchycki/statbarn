import { Database } from '@/lib/db'
import { ModelVersionModel } from '@/models/modelVersion'
import { ModelBacktest, ModelVersion } from '@/types/modelVersion'
import type { ModelParams } from '@statbarn/prediction-core'

const connectDatabase = () => Database.getInstance().connect()

export async function getActiveModelVersion(): Promise<ModelVersion | null> {
  await connectDatabase()
  return ModelVersionModel.findOne({ status: 'active' }).lean<ModelVersion>()
}

export async function getModelVersion(
  version: string
): Promise<ModelVersion | null> {
  await connectDatabase()
  return ModelVersionModel.findOne({ version }).lean<ModelVersion>()
}

export async function createDraftModelVersion(draft: {
  version: string
  params: ModelParams
  notes: string
  basedOn?: string
  backtest?: ModelBacktest
}): Promise<void> {
  await connectDatabase()
  await ModelVersionModel.create({ ...draft, status: 'draft' })
}

export async function saveModelBacktest(
  version: string,
  backtest: ModelBacktest
): Promise<void> {
  await connectDatabase()
  await ModelVersionModel.updateOne({ version }, { $set: { backtest } })
}

// Retires the current active version first so the one-active index holds
export async function activateModelVersion(version: string): Promise<void> {
  await connectDatabase()
  const now = new Date()
  await ModelVersionModel.updateOne(
    { status: 'active' },
    { $set: { status: 'retired', retiredAt: now } }
  )
  await ModelVersionModel.updateOne(
    { version },
    { $set: { status: 'active', activatedAt: now } }
  )
}
