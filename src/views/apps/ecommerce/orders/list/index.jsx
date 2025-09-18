'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid2'

import OrderCard from './OrderCard'
import OrderListTable from './OrderListTable'
import { fetchOrders } from '@/redux-store/slices/order' // <-- import it

const OrderList = () => {
  const dispatch = useDispatch()
  const { orders, loading, error, pagination, orderStats } = useSelector(state => state.orders)

  console.log(pagination, 'pagination')

  // parent-controlled server params
  const [page, setPage] = useState(1)
  
  // const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    dispatch(
      fetchOrders({
        page: pagination.currentPage || 1,
        limit: pagination.itemsPerPage || 25,
        search: search,
        filters: filters
      })
    )
  }, [dispatch, pagination.currentPage, pagination.itemsPerPage, search, filters])

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
          page={pagination.currentPage} // use backend's currentPage
          limit={pagination.itemsPerPage} // use backend's itemsPerPage
          total={pagination.total || 0}
          onPageChange={nextPage => {
            dispatch(fetchOrders({ page: nextPage, limit: pagination.itemsPerPage, search, filters }))
          }}
          onLimitChange={newLimit => {
            dispatch(fetchOrders({ page: 1, limit: newLimit, search, filters }))
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

export default OrderList
