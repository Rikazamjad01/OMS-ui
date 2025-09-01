// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import OrderDetailHeader from './OrderDetailHeader'
import OrderDetailsCard from './OrderDetailsCard'
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'
import OrderComments from './orderComments'

const OrderDetails = async ({ params }) => {
let data = await params

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderDetailHeader  order={data.id}  />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderDetailsCard />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingActivity order={data.id} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderComments orderData={data.id} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomerDetails orderData={data.id} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderDetails
