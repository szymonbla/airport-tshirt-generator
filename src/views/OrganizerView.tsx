import { useState } from 'react'
import { Button } from '../components/ui/button'
import { drawEngine, type Assignment } from '../lib/drawEngine'

export default function OrganizerView() {
  const [names, setNames] = useState<string[]>([''])
  const [assignments, setAssignments] = useState<Assignment[] | null>(null)

  const updateName = (i: number, value: string) => {
    setNames(prev => prev.map((n, idx) => (idx === i ? value : n)))
  }

  const addName = () => setNames(prev => [...prev, ''])

  const removeName = (i: number) => {
    setNames(prev => prev.filter((_, idx) => idx !== i))
    setAssignments(null)
  }

  const validNames = names.map(n => n.trim()).filter(Boolean)
  const canDraw = validNames.length >= 2

  const handleDraw = () => {
    setAssignments(drawEngine(validNames))
  }

  return (
    <main className="mx-auto max-w-md p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">T-Shirt Draw</h1>

      <div className="flex flex-col gap-2">
        {names.map((name, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-1.5 text-sm"
              placeholder={`Participant ${i + 1}`}
              value={name}
              onChange={e => updateName(i, e.target.value)}
            />
            {names.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => removeName(i)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={addName}>+ Add participant</Button>
      </div>

      <Button disabled={!canDraw} onClick={handleDraw}>Draw</Button>

      {assignments && (
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Assignments</h2>
          {assignments.map(({ giver, recipient }) => (
            <p key={giver} className="text-sm">
              <span className="font-medium">{giver}</span> → {recipient}
            </p>
          ))}
        </div>
      )}
    </main>
  )
}
