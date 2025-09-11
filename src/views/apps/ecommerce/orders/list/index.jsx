'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

import OrderCard from './OrderCard'
import OrderListTable from './OrderListTable'
import { fetchOrders } from '@/redux-store/slices/order' // <-- import it

const OrderList = () => {
  const dispatch = useDispatch()
  const { orders, loading, error, pagination = {}, orderStats } = useSelector(state => state.orders)

  // parent-controlled server params
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    dispatch(fetchOrders({ page, limit, search, filters }))
  }, [dispatch, page, limit, search, filters])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderCard orderStats={orderStats} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <OrderListTable
          orderData={orders}
          loading={loading}
          error={error}

          // pass server-side pagination info
          page={pagination.currentPage || page}
          limit={pagination.itemsPerPage || limit}
          total={pagination.total || 0}

          // handlers to update parent state (which re-fetches)
          onPageChange={setPage}
          onLimitChange={(v) => { setPage(1); setLimit(v) }}
          onSearchChange={(q) => { setPage(1); setSearch(q) }}
          onFiltersChange={(f) => { setPage(1); setFilters(f) }}
        />
      </Grid>
    </Grid>
  )
}

export default OrderList
