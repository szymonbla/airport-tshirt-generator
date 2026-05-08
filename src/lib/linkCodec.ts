export interface Assignment {
  giver: string
  recipient: string
}

export function encode(assignment: Assignment): string {
  const json = JSON.stringify({ g: assignment.giver, r: assignment.recipient })
  return btoa(encodeURIComponent(json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decode(param: string): Assignment | null {
  if (!param) return null
  try {
    const base64 = param.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
    const json = JSON.parse(decodeURIComponent(atob(padded)))
    if (typeof json.g !== 'string' || typeof json.r !== 'string') return null
    return { giver: json.g, recipient: json.r }
  } catch {
    return null
  }
}
