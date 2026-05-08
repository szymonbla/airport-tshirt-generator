export interface Assignment {
  giver: string
  recipient: string
}

export interface AssignmentPayload {
  giver: string
  recipient: string
}

export const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'] as const
export type Size = typeof VALID_SIZES[number]

export type RecipientSizeResult = { known: true; size: string } | { known: false }
export type NotifyResult = { subscribed: true } | { alreadyKnown: true; size: string }
