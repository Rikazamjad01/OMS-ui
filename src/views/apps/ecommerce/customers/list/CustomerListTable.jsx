'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'

// Redux Imports
import { useSelector, useDispatch } from 'react-redux'

import {
  fetchCustomers,
  setCustomersCurrentPage,
  setCustomersItemsPerPage,
  selectCustomersLoading,
  selectCustomersTableRows,
  selectCustomersPagination
} from '@/redux-store/slices/customer'

// Component Imports
import AddCustomerDrawer from './AddCustomerDrawer'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
}
export const statusChipColor = {
  Delivered: { color: 'success' },
  'Out for Delivery': { color: 'primary' },
  'Ready to Pickup': { color: 'info' },
  Dispatched: { color: 'warning' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const CustomerListTable = () => {
  // Redux Hooks
  const dispatch = useDispatch()
  const loading = useSelector(selectCustomersLoading)
  const tableRows = useSelector(selectCustomersTableRows)
  const pagination = useSelector(selectCustomersPagination)

  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  // Fetch data when pagination changes
  useEffect(() => {
    dispatch(fetchCustomers({ page: pagination.page, perPage: pagination.perPage }))
  }, [dispatch, pagination.page, pagination.perPage])

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'Customers',
        cell: ({ row }) => {
          const firstName = row.original?.first_name?.trim() || ''
          const lastName = row.original?.last_name?.trim() || ''
          const fullName = [firstName, lastName].filter(Boolean).join(' ') || '-'

          return (
            <div className='flex items-center gap-3'>
              {getAvatar({ avatar: row.original?.avatar, customer: fullName })}
              <div className='flex flex-col items-start'>
                <Typography
                  variant='h6'
                  component={Link}
                  href={getLocalizedUrl(`/apps/ecommerce/customers/details/${row.original?.id}`, locale)}
                  className='hover:text-primary'
                >
                  {fullName}
                </Typography>
                <Typography variant='body2'>{row.original?.email || '-'}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('id', {
        header: 'Customer Id',
        cell: ({ row }) => <Typography color='text.primary'>#{row.original?.id || 'N/A'}</Typography>
      }),
      columnHelper.accessor('country', {
        header: 'Country',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {/* {row.original?.countryFlag && <img src={row.original.countryFlag} height={22} alt={row.original.country} />} */}
            <Typography>{row.original?.country || 'N/A'}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('orders', {
        header: 'Orders',
        cell: ({ row }) => <Typography>{row.original?.total_Orders || 0}</Typography>
      }),
      columnHelper.accessor('total_spent', {
        header: 'Total Spent',
        cell: ({ row }) => <Typography variant='h6'>${(row.original?.total_spent || 0).toLocaleString()}</Typography>
      })
    ],
    [locale]
  )

  const handleChangePage = (event, newPage) => {
    const nextPage = newPage + 1

    dispatch(setCustomersCurrentPage(nextPage))
    dispatch(fetchCustomers({ page: nextPage, perPage: pagination.perPage }))
  }

  const handleChangeRowsPerPage = event => {
    const newPerPage = Number(event.target.value)

    dispatch(setCustomersItemsPerPage(newPerPage))
    dispatch(setCustomersCurrentPage(1))
    dispatch(fetchCustomers({ page: 1, perPage: newPerPage }))
  }

  // Create table only when we have data
  const table = useReactTable({
    data: tableRows || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true
  })

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34} className='bg-primary text-white'>
          {getInitials(customer || 'N/A')}
        </CustomAvatar>
      )
    }
  }

  // const handleChangePage = (event, newPage) => {
  //   dispatch(setCustomersCurrentPage(newPage + 1))
  // }

  // const handleChangeRowsPerPage = event => {
  //   const newPerPage = parseInt(event.target.value, 10)

  //   dispatch(setCustomersItemsPerPage(newPerPage))
  //   dispatch(setCustomersCurrentPage(1))
  // }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          />
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            <CustomTextField
              select
              value={pagination.perPage}
              onChange={handleChangeRowsPerPage}
              className='max-sm:is-full sm:is-[80px]'
            >
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </CustomTextField>
            <Button variant='tonal' color='secondary' startIcon={<i className='bx-export' />}>
              Export
            </Button>
            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='bx-plus' />}
              onClick={() => setCustomerUserOpen(!customerUserOpen)}
            >
              Add Customer
            </Button>
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='bx-chevron-up text-xl' />,
                            desc: <i className='bx-chevron-down text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {!tableRows || tableRows.length === 0 ? (
                <tr>
                  <td colSpan={table.getAllColumns().length} className='text-center py-4'>
                    No customers found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          component='div'
          count={pagination?.total || 0}
          rowsPerPage={pagination?.perPage || 25}
          page={pagination?.page ? pagination.page - 1 : 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Card>
      <AddCustomerDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        onSuccess={() => dispatch(fetchCustomers({ page: pagination.page, perPage: pagination.perPage }))}
      />
    </>
  )
}

export default CustomerListTable
