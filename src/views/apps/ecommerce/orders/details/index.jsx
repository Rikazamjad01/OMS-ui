'use client'

import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

import OrderDetailHeader from './OrderDetailHeader'
import OrderDetailsCard from './OrderDetailsCard'
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'
import OrderComments from './orderComments'

import { fetchOrderById, selectOrdersLoading, selectOrdersError, selectOrderById } from '@/redux-store/slices/order'

const OrderDetails = ({ id }) => {

  const dispatch = useDispatch()

  const loading = useSelector(selectOrdersLoading)
  const error = useSelector(selectOrdersError)
  const order = useSelector((state) => state.orders.selectedOrders)

  console.log(order, 'order details')

  // console.log(order, 'orders')

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id))
    }
  }, [id, dispatch])

  if (loading) return <p>Loading order...</p>
  if (error) return <p>Error: {error}</p>
  if (!order) return <p>No order found</p>

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderDetailHeader order={order} id={id}/>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderDetailsCard order={order}/>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingActivity order={order}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderComments order={order}/>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomerDetails order={order}/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderDetails
