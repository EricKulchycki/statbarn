'use client'

import { useRouter } from 'next/router'

export default function Team() {
  const router = useRouter()

  return (
    <div className="flex justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          Team Predictions Page for {router.query.team}
        </h1>
        <p>This is a placeholder for the team predictions page.</p>
      </div>
    </div>
  )
}
