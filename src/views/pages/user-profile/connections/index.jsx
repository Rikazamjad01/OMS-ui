"use client"

// MUI Imports
import { useState } from 'react'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import { Checkbox, LinearProgress, MenuItem, TextField } from '@mui/material'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@/@core/components/mui/Avatar'
import BaseTable from '../baseTable/page'

const Connections = ({ data }) => {
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [amountFilter, setAmountFilter] = useState('')

  if (!Array.isArray(data)) {
    data = [data]
  }

  const filteredData = data.filter(row => {
    const matchProduct = productFilter ? row.name?.toLowerCase().includes(productFilter.toLowerCase()) : true
    const matchStatus = statusFilter ? row.status === statusFilter : true
    const matchAmount = amountFilter ? row.amount >= Number(amountFilter) : true

    return matchProduct && matchStatus && matchAmount
  })

  const orderColumns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <Typography color='text.primary'>{new Date(row.original.createdAt).toDateString()}</Typography>
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <CustomAvatar src={row.original.avatar || '/images/products/productPlaceholder.png'} size={34} />
          <div className='flex flex-col'>
            <Typography variant='h6'>{row.original.name || 'Product Name'}</Typography>
            <Typography variant='body2'>{row.original.platform || 'Shopify'}</Typography>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => <Chip label={row.original.platform || 'Shopify'} />,
      enableSorting: false
    },
    {
      accessorKey: 'commissionStatus',
      header: 'Status of Commmission',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Chip color='text.primary' varent='tonal'>
            {row.original.status || 'Pending'}
          </Chip>
        </div>
      )
    },
    {
      accessorKey: 'amountStatus',
      header: 'Commission amount',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Typography color='text.primary'>{`${row.original.status || 0}`}</Typography>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: () => (
        <OptionMenu
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={[
            'Details',
            'Archive',
            { divider: true },
            { text: 'Delete', menuItemProps: { className: 'text-error' } }
          ]}
        />
      ),
      enableSorting: false
    }
  ]

  return (
    <Grid container spacing={6}>
      {data && (
        <Grid size={{ xs: 12 }}>
          <BaseTable
            title='Daily Order List'
            data={filteredData}
            columns={orderColumns}
            extraFilters={
              <div className='flex gap-3'>
                {/* Product Name */}
                <TextField
                  label='Product Name'
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value)}
                  className='min-w-[220px]'
                />

                {/* Status of Commission */}
                <TextField
                  select
                  label='Commission Status'
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='min-w-[200px]'
                >
                  <MenuItem value=''>All</MenuItem>
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='Confirmed'>Confirmed</MenuItem>
                  <MenuItem value='Cancelled'>Cancelled</MenuItem>
                </TextField>

                {/* Commission Amount */}
                <TextField
                  type='number'
                  label='Min Commission Amount'
                  value={amountFilter}
                  onChange={e => setAmountFilter(e.target.value)}
                  className='min-w-[150px]'
                />
              </div>
            }
          />
        </Grid>
      )}
    </Grid>
  )
}

export default Connections
