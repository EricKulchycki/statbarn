import { Database } from '../lib/db'
import { PredictionModel } from '../models/prediction'
;(async () => {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    // Step 1: Find duplicate records grouped by `gameId`
    const duplicates = await PredictionModel.aggregate([
      {
        $sort: { gameId: 1, createdAt: -1 }, // Sort by `gameId` and `createdAt` (newest first)
      },
      {
        $group: {
          _id: '$gameId', // Group by `gameId`
          docs: { $push: '$_id' }, // Collect all document IDs for this `gameId`
          newest: { $first: '$_id' }, // Keep the newest document ID
        },
      },
      {
        $project: {
          _id: 0,
          docsToDelete: { $slice: ['$docs', 1] }, // Exclude the newest document
        },
      },
    ])

    // Step 2: Extract IDs of documents to delete
    const idsToDelete = duplicates.flatMap((doc) => doc.docsToDelete)

    // Step 3: Delete the older duplicates
    const result = await PredictionModel.deleteMany({
      _id: { $in: idsToDelete },
    })

    console.log(`Deleted ${result.deletedCount} duplicate records.`)
  } catch (error) {
    console.error('Error removing duplicates:', error)
  } finally {
    // Disconnect from the database
    db.disconnect()
  }
})()
