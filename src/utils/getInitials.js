// Returns initials from string
export const getInitials = string => {
  if (!string) return null

  const initials = string
    .trim()
    .split(/\s+/)
    .map(word => {
      // Find first English letter in each word
      const match = word.match(/[A-Za-z]/)
      
      return match ? match[0] : ''
    })
    .join('')
    .toUpperCase()

  return initials || null // return null if no initials
}
