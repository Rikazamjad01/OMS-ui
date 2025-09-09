'use client'

import { useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerDetailsHeader from './CustomerDetailsHeader'
import CustomerLeftOverview from './customer-left-overview'
import CustomerRight from './customer-right'

// Redux
import {
  fetchCustomerById,
  selectSelectedCustomer,
  selectSelectedCustomerLoading,
  selectSelectedCustomerError
} from '@/redux-store/slices/customer'

// Dynamically import tabs
const OverViewTab = dynamic(() => import('./customer-right/overview'), {
  ssr: false,
  loading: () => <div>Loading overview...</div>
})

const CustomerDetails = ({ customerId }) => {

  console.log(customerId, 'customerId in CustomerDetails')

  const dispatch = useDispatch()

  const customerData = useSelector(selectSelectedCustomer)
  const loading = useSelector(selectSelectedCustomerLoading)
  const error = useSelector(selectSelectedCustomerError)

  // Fetch customer details on mount / customerId change
  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId))
    }
  }, [customerId, dispatch])

  // Build tab content list from selectedCustomer data
  const tabContentList = {
    overview: <OverViewTab customerData={customerData} />

    // You can add more tabs here if needed
  }

  // Handle edge cases
  if (!customerId) return <div>Customer ID not found.</div>
  if (loading) return <div>Loading customer details...</div>
  if (error) return <div>Error: {error}</div>
  if (!customerData) return <div>No customer data found.</div>

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <CustomerDetailsHeader customerData={customerData} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <CustomerLeftOverview customerData={customerData} customerId={customerId} />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <CustomerRight customerData={customerData} tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default CustomerDetails
