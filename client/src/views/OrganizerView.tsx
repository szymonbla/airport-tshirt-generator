import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '../components/ui/button'
import { drawEngine, type Assignment } from '../lib/drawEngine'
import { buildAssignmentLink } from '../lib/linkCodec'

function assignmentLink(giver: string, recipient: string): string {
  const base = window.location.origin + window.location.pathname
  return buildAssignmentLink(base, giver, recipient)
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
      {copied ? 'Skopiowano!' : 'Kopiuj'}
    </Button>
  )
}

type FormValues = { names: { value: string }[] }

export default function OrganizerView() {
  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { names: [{ value: '' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'names' })
  const [assignments, setAssignments] = useState<Assignment[] | null>(null)

  const lastInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    lastInputRef.current?.focus()
  }, [fields.length])

  const watchedNames = watch('names')
  const validNames = watchedNames.map(f => f.value.trim()).filter(Boolean)
  const canDraw = validNames.length >= 2

  const onSubmit = (data: FormValues) => {
    const names = data.names.map(f => f.value.trim()).filter(Boolean)
    setAssignments(drawEngine(names))
  }

  return (
    <main className="mx-auto max-w-lg p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Szmatex</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {fields.map((field, i) => {
            const isLast = i === fields.length - 1
            const { ref: rhfRef, ...rest } = register(`names.${i}.value`)
            return (
              <div key={field.id} className="flex gap-2">
                <input
                  {...rest}
                  ref={el => {
                    rhfRef(el)
                    if (isLast) lastInputRef.current = el
                  }}
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                  placeholder={`Uczestnik ${i + 1}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && watchedNames[i]?.value.trim()) {
                      e.preventDefault()
                      if (isLast) append({ value: '' })
                    }
                  }}
                />
                {fields.length > 1 && (
                  <Button variant="outline" size="sm" type="button" onClick={() => { remove(i); setAssignments(null) }}>
                    Usuń
                  </Button>
                )}
              </div>
            )
          })}
          <Button variant="outline" type="button" onClick={() => append({ value: '' })}>
            + Dodaj uczestnika
          </Button>
        </div>

        <Button type="submit" disabled={!canDraw}>Losuj</Button>
      </form>

      {assignments && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Linki z przydziałami</h2>
          <p className="text-sm text-gray-500">Wyślij każdy link prywatnie do odpowiedniego uczestnika.</p>
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Uczestnik</th>
                  <th className="px-4 py-2 font-medium">Link</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.map(({ giver, recipient }) => {
                  const link = assignmentLink(giver, recipient)
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
