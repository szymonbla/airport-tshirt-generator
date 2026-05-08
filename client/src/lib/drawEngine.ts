import type { Assignment } from './types'
export type { Assignment } from './types'

export function drawEngine(participants: string[]): Assignment[] {
  if (participants.length < 2) {
    throw new Error('Need at least 2 participants');
  }

  const recipients = [...participants];

  // Fisher-Yates shuffle until we get a valid derangement
  do {
    for (let i = recipients.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
    }
  } while (recipients.some((r, i) => r === participants[i]));

  return participants.map((giver, i) => ({ giver, recipient: recipients[i] }));
}
