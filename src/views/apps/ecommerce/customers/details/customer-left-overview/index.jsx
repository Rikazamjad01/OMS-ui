// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerDetails from './CustomerDetails'
import CustomerPlan from './CustomerPlan'
import AddressBilling from '../customer-right/address-billing'
import OrderList from '../../../orders/list'
import OrderListTable from '../customer-right/overview/OrderListTable'

import { getStatisticsData, getEcommerceData } from '@/app/server/actions'

const CustomerLeftOverview = ({ customerId, customerData, order}) => {

    // const tableData = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerDetails customerData={customerData} customerId={customerId} order={order} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {/* <CustomerPlan /> */}
        {/* <AddressBilling /> */}
        {/* <OrderListTable orderData={tableData?.orderData} /> */}
      </Grid>
    </Grid>
  )
}

export default CustomerLeftOverview
