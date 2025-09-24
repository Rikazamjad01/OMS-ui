'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

import { fetchBookingOrder } from '@/redux-store/slices/bookingSlice' // <-- import it
import OrderCard from '@/views/apps/ecommerce/orders/list/OrderCard'
import BookingListTable from './BookingListTable'
// import OrderListTable from '@/views/apps/ecommerce/orders/list/OrderListTable'

const BookingOrder = () => {
  const dispatch = useDispatch()
  const { orders, loading, error, pagination, orderStats } = useSelector(state => state.booking)

  // Parent-controlled params (decouple from redux pagination to avoid loops)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    dispatch(
      fetchBookingOrder({
        page: page,
        limit: limit,
        search: search,
        filters: filters
      })
    )
  }, [dispatch, page, limit, search, filters])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderCard orderStats={orderStats} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <BookingListTable
          orderData={orders}
          loading={loading}
          error={error}
          page={page}
          limit={limit}
          total={pagination.total || 0}
          onPageChange={nextPage => {
            setPage(nextPage)
          }}
          onLimitChange={newLimit => {
            setPage(1)
            setLimit(newLimit)
          }}
          onSearchChange={q => {
            setPage(1)
            setSearch(q)
          }}
          onFiltersChange={f => {
            setPage(1)
            setFilters(f)
          }}
        />
      </Grid>
    </Grid>
  )
}

export default BookingOrder
