'use server'

import { UserModel } from '@/models/user'
import { Database } from '@/lib/db'

export interface SyncUserData {
  firebaseUid: string
  email: string
  displayName?: string | null
  photoURL?: string | null
}

export async function syncUserToDatabase(userData: SyncUserData) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const user = await UserModel.findOneAndUpdate(
      { firebaseUid: userData.firebaseUid },
      {
        firebaseUid: userData.firebaseUid,
        email: userData.email,
        displayName: userData.displayName || undefined,
        photoURL: userData.photoURL || undefined,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    return {
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        favoriteTeams: user.favoriteTeams,
      },
    }
  } catch (error) {
    console.error('Error syncing user to database:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateUserFavoriteTeams(
  firebaseUid: string,
  teams: string[]
) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const user = await UserModel.findOneAndUpdate(
      { firebaseUid },
      { favoriteTeams: teams },
      { new: true }
    )

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    return {
      success: true,
      favoriteTeams: user.favoriteTeams,
    }
  } catch (error) {
    console.error('Error updating favorite teams:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getUserByFirebaseUid(firebaseUid: string) {
  try {
    const db = Database.getInstance()
    await db.connect()

    const user = await UserModel.findOne({ firebaseUid })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    return {
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        favoriteTeams: user.favoriteTeams,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
