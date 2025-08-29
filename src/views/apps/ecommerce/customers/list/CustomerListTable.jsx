'use client'

import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table'

// Component Imports
import TablePagination from '@mui/material/TablePagination'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchCustomers,
  selectCustomersLoading,
  selectCustomersPagination,
  setCustomersItemsPerPage,
  setCustomersCurrentPage,
  selectCustomersTableRows
} from '@/redux-store/slices/customer'

// Vars
const statusObj = {
  active: { color: 'success' },
  inactive: { color: 'secondary' },
  pending: { color: 'warning' },
  blocked: { color: 'error' }
}

const CustomerListTable = ({ globalFilter }) => {
  const dispatch = useDispatch()
  const customers = useSelector(selectCustomersTableRows)
  const loading = useSelector(selectCustomersLoading)
  const pagination = useSelector(selectCustomersPagination)

  const [rowSelection, setRowSelection] = useState({})

  // Define columns
  const columns = useMemo(
    () => [
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
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>
      },
      {
        accessorKey: 'first_name',
        header: 'First Name',
        cell: ({ row }) => <Typography>{row.original.first_name}</Typography>
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        cell: ({ row }) => <Typography>{row.original.last_name}</Typography>
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone}</Typography>
      }
    ],
    []
  )

  // React Table setup
  const table = useReactTable({
    data: customers,
    columns,
    pageCount: Math.ceil(pagination.total / pagination.itemsPerPage),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  })

  // Fetch customers whenever pagination or search changes
  useEffect(() => {
    dispatch(
      fetchCustomers({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: globalFilter || '',
        filters: {} // extend later if needed
      })
    )
  }, [dispatch, pagination.currentPage, pagination.itemsPerPage, globalFilter])

  return (
    <Card>
      <CardHeader title='Customers' />
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='min-w-full border'>
            <thead className='bg-gray-50'>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='px-4 py-2 text-left'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className='text-center py-4'>
                    Loading...
                  </td>
                </tr>
              ) : customers.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className='border-b'>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='px-4 py-2'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className='text-center py-4'>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={pagination.total}
          page={pagination.currentPage - 1}
          rowsPerPage={pagination.itemsPerPage}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
            dispatch(setCustomersCurrentPage(page + 1))
          }}
          onRowsPerPageChange={e => {
            const size = Number(e.target.value)

            table.setPageSize(size)
            dispatch(setCustomersItemsPerPage(size))
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </CardContent>
    </Card>
  )
}

export default CustomerListTable
