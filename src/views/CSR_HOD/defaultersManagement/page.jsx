'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

import { fetchBookingOrder } from '@/redux-store/slices/bookingSlice'
import DefaultersListTable from './defaulterListTable'
import DefaulterCard from './defaulterCards'

// import OrderListTable from '@/views/apps/ecommerce/orders/list/OrderListTable'

const DefaultersManagementPage = () => {
  const dispatch = useDispatch()
  const { orders, loading, error, pagination, orderStats } = useSelector(state => state.booking)

  console.log(orderStats, 'order stats')

  // Parent-controlled params (decouple from redux pagination to avoid loops)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    dispatch(
      fetchBookingOrder({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage || 50,
        search,
        filters,
        force: true
      })
    )
  }, [dispatch, search, filters, pagination.currentPage, pagination.itemsPerPage])
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <DefaulterCard orderStats={orderStats} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <DefaultersListTable
          orderData={orders}
          loading={loading}
          error={error}
          page={pagination.currentPage}
          limit={pagination.itemsPerPage}
          total={pagination.total || 0}
          onPageChange={nextPage => {
            dispatch(fetchBookingOrder({ page: nextPage, limit: pagination.itemsPerPage, search, filters }))
          }}
          onLimitChange={newLimit => {
            dispatch(fetchBookingOrder({ page: 1, limit: newLimit, search, filters }))
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

export default DefaultersManagementPage
