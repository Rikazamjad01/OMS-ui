// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Utility function for safe number display
const formatNumber = num => (num != null ? num.toLocaleString() : '0')

const UserListCards = ({ data }) => {
  // Fallback in case data is not available yet
  const {
    total = 0,
    totalVerified = 0,
    totalUnverified = 0
  } = data || {}

  // Dynamically build cards
  const cards = [
    {
      title: 'Total Users',
      stats: formatNumber(total),
      avatarIcon: 'bx-group',
      avatarColor: 'primary',
      trendNumber: '',
      subtitle: 'All registered users'
    },
    {
      title: 'Active Users',
      stats: formatNumber(totalVerified),
      avatarIcon: 'bx-user-check',
      avatarColor: 'success',
      trendNumber: '',
      subtitle: 'Active accounts'
    },
    {
      title: 'In-Active Users',
      stats: formatNumber(totalUnverified),
      avatarIcon: 'bx-user-x',
      avatarColor: 'warning',
      trendNumber: '',
      subtitle: 'In-Active accounts'
    }
  ]

  return (
    <Grid container spacing={6}>
      {cards.map((item, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
