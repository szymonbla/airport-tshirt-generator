export interface Trip {
  id: number
  name: string
  createdAt: string
}

export interface TripDetail extends Trip {
  participants: string[]
  assignments: { giverName: string; recipientName: string }[]
}

export interface Assignment {
  giver: string
  recipient: string
}

export interface AssignmentPayload {
  giver: string
  recipient: string
  tripId: number
}

export const VALID_SIZES = ['MEGA MAŁY', 'MAŁY, ALE ŚMIERDZI JAK DUŻY', 'ŚREDNIA AZJATYCKA', 'DUŻY EUROPEJSKI', 'GRUBY', '2X GRUBY', '3X GRUBY'] as const
export type Size = typeof VALID_SIZES[number]

export type RecipientSizeResult = { known: true; size: string } | { known: false }
export type NotifyResult = { subscribed: true } | { alreadyKnown: true; size: string }
