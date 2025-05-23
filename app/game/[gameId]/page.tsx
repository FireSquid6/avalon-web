
export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  return (
    <div>
      <p>Game id: {gameId}</p>
    </div>
  )

}
