export default async function Team({
  params,
}: {
  params: Promise<{ team: string }>
}) {
  const { team } = await params
  return (
    <div className="flex justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          Team Predictions Page for {team}
        </h1>
        <p>This is a placeholder for the team predictions page.</p>
      </div>
    </div>
  )
}
