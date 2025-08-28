'use client'
import { useMemo, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerDetailsHeader from './CustomerDetailsHeader'
import CustomerLeftOverview from './customer-left-overview'
import CustomerRight from './customer-right'

// Redux
import { fetchOrders, selectCustomerById } from '@/redux-store/slices/order'

// Dynamically import tabs
const OverViewTab = dynamic(() => import('./customer-right/overview'), {
  ssr: false,
  loading: () => <div>Loading overview...</div>
})

const CustomerDetails = ({ customerId }) => {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.orders.orders)
  const loading = useSelector(state => state.orders.loading)
  const selectedCustomer = useSelector(state => selectCustomerById(state, customerId))

  const [hasFetched, setHasFetched] = useState(false)

  // Find the order that matches customerId
  const orderWithCustomer = useMemo(() => {
    if (!customerId || !orders.length) return null

return orders.find(order => order.customerData?.id == customerId) || null
  }, [customerId, orders])

  // Extract customerData
  const customerData = orderWithCustomer?.customerData || null

  // Fetch orders only once when component mounts
  useEffect(() => {
    if (!hasFetched && customerId) {
      dispatch(
        fetchOrders({
          filters: { customer_id: customerId },
          page: 1,
          limit: 10
        })
      )
      setHasFetched(true)
    }
  }, [customerId, dispatch, hasFetched])

  // Memoize tab content
  const tabContentList = useMemo(
    () => ({
      overview: <OverViewTab customerData={customerData} order={orderWithCustomer} />
    }),
    [customerData, orderWithCustomer]
  )

  // Handle edge cases
  if (loading && !hasFetched) return <div>Loading customer details...</div>
  if (!customerId) return <div>Customer ID not found.</div>
  if (!customerData?.email) return <div>No customer data found for ID: {customerId}.</div>

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <CustomerDetailsHeader customerData={customerData} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <CustomerLeftOverview customerData={customerData} />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <CustomerRight orders={orders} tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default CustomerDetails
