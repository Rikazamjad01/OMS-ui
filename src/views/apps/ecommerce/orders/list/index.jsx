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

  console.log(pagination, 'pagination')

  // parent-controlled server params
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    console.log
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
          page={page} // use backend's currentPage
          limit={limit} // use backend's itemsPerPage
          total={pagination.total || 0}
          onPageChange={(subhan)=>{
            setPage(subhan)
            console.log(subhan, "on page change")
            }}
          onLimitChange={v => {
            setPage(1)
            setLimit(v)
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
