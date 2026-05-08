import { useState } from 'react'
import { Button } from '../components/ui/button'
import { drawEngine, type Assignment } from '../lib/drawEngine'
import { encode } from '../lib/linkCodec'

function assignmentLink(recipient: string): string {
  const base = window.location.origin + window.location.pathname
  return `${base}#/reveal?r=${encode(recipient)}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )
}

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
    <main className="mx-auto max-w-lg p-6 flex flex-col gap-6">
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
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Assignment Links</h2>
          <p className="text-sm text-gray-500">Send each link privately to the correct participant.</p>
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Participant</th>
                  <th className="px-4 py-2 font-medium">Link</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.map(({ giver, recipient }) => {
                  const link = assignmentLink(recipient)
                  return (
                    <tr key={giver}>
                      <td className="px-4 py-2 font-medium whitespace-nowrap">{giver}</td>
                      <td className="px-4 py-2 max-w-xs">
                        <span className="block truncate text-gray-500 font-mono text-xs">{link}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <CopyButton text={link} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
