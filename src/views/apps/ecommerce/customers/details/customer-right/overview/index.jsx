'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { useSelector } from 'react-redux'

import CustomerStatisticsCard from './CustomerStatisticsCard'
import OrderListTable from './OrderListTable'

// import AddressBilling from '../address-billing'

// Redux Imports

const Overview = ({ customerData }) => {
  // Get order data from Redux store if needed
  const { orders } = useSelector(state => state.orders)

  console.log(customerData, 'customerData in Overview')

  // If customerData is not passed as prop, try to get it from Redux
  // const customer = customerData || {}

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerStatisticsCard customerData={customerData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {/* Show orders for this customer */}
        <OrderListTable orders={orders} customerId={customerData?.id} />
        {/* Or show address billing if that's what you want */}
        {/* <AddressBilling customerData={customer} /> */}
      </Grid>
    </Grid>
  )
}

export default Overview
