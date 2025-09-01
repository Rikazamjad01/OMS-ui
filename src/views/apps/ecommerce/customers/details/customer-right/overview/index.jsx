'use client'

import Grid from '@mui/material/Grid2'
import { useSelector } from 'react-redux'

// Component Imports
import CustomerStatisticsCard from './CustomerStatisticsCard'
import OrderListTable from './OrderListTable'

const Overview = ({ customerData, order }) => {
  // You already have the single order for this customer
  // But still can fallback to Redux if you want the whole list
  // const { orders } = useSelector(state => state.orders)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {/* Pass down both customerData and their order */}
        <CustomerStatisticsCard order={order} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        {/* Show only orders for this customer */}
        <OrderListTable order={order} customerData={customerData}/>
      </Grid>
    </Grid>
  )
}

export default Overview
