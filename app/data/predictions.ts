import { Database } from 'lib/db'
import { PredictionModel } from 'models/prediction'

export async function getPredictions(date: Date) {
  await Database.getInstance().connect()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  console.log({ date, startOfDay, endOfDay })

  const predictions = await PredictionModel.find({
    gameDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })

  console.log(predictions)

  return { predictions: predictions.map((prediction) => prediction.toObject()) }
}
