// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerStats from '@components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ order = [] }) => {
  // console.log(order, 'order in CustomerStatisticsCard')

  return (
    <Grid container spacing={6}>
      {order?.map((item, index) => (
        <Grid size={{ xs: 12, md: 6 }} key={index}>
          <CustomerStats {...item} />
        </Grid> )
        )}
    </Grid>
  )
}

export default CustomerStatisticsCard
