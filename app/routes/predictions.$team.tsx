import { json, MetaFunction, useParams } from '@remix-run/react'
import { APP_CONFIG } from '~/constants'

export const meta: MetaFunction = () => {
  return [
    { title: APP_CONFIG.name },
    { name: 'description', content: APP_CONFIG.description },
  ]
}

export async function loader() {
  return json({})
}

export default function PredictionsPage() {
  const { team } = useParams()

  console.log('Selected team:', team)
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Team Predictions</h1>
    </div>
  )
}
