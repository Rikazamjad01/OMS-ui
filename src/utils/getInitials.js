// Returns initials from string
export const getInitials = string => {
  if (!string) return null

  const initials = string
    .trim()
    .split(/\s+/)
    .reduce((response, word) => (response += word[0] || ''), '')
    .toUpperCase()

  return initials || null // return null if no initials
}
