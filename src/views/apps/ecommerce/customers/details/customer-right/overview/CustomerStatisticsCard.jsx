// CustomerStatisticsCard.jsx
import Grid from '@mui/material/Grid2'

import CustomerStatsCard from '@/components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ customerData }) => {
  if (!customerData) return null

  // if it's not already an array, wrap it
  const statsArray = Array.isArray(customerData) ? customerData : [customerData]

  return (
    <Grid container spacing={6}>
      {statsArray.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, md: 6 }}>
          <CustomerStatsCard {...stat} />
        </Grid>
      ))}
    </Grid>
  )
}

export default CustomerStatisticsCard
