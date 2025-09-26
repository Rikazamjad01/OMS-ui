'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'

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
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import DepartmentDialog from '@components/dialogs/department-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { getAllDepartments } from '@/redux-store/slices/roleSlice'

// Vars
const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
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

const Permissions = () => {
  // Redux
  const dispatch = useDispatch()
  const { departments, departmentPagination } = useSelector(state => state.role)

  // States
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editDepartment, setEditDepartment] = useState(null)

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Server-side pagination state (0-based page for UI)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(9)

  // Fetch departments on mount and whenever page/rowsPerPage change
  useEffect(() => {
    dispatch(getAllDepartments({ params: { page: page + 1, limit: rowsPerPage }, force: true }))
  }, [dispatch, page, rowsPerPage])

  useEffect(() => {
    setData(departments || [])
  }, [departments])

  const totalCount = departmentPagination?.total || 0

  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Add Department',
    onClick: () => handleAddDepartment(),
    className: 'max-sm:is-full',
    startIcon: <i className='bx-plus' />
  }

  // Hooks
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => <Typography color='text.secondary'>{row.original.description}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: ({ row }) => (
          <Typography>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditDepartment(row.original)}>
              <i className='bx-edit text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: rowsPerPage
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleEditDepartment = dept => {
    setOpen(true)
    setEditDepartment(dept)
  }

  const handleAddDepartment = () => {
    setEditDepartment(null)
  }

  const handleChangeRowsPerPage = e => {
    setRowsPerPage(Number(e.target.value))
    setPage(0)
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4 flex-wrap sm:flex-row items-start sm:items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Typography>Show</Typography>
            <CustomTextField select value={rowsPerPage} onChange={handleChangeRowsPerPage} className='is-[70px]'>
              <MenuItem value='5'>5</MenuItem>
              <MenuItem value='7'>7</MenuItem>
              <MenuItem value='9'>9</MenuItem>
            </CustomTextField>
          </div>
          <div className='flex flex-col sm:flex-row flex-wrap gap-4 is-full sm:is-auto'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Departments'
              className='max-sm:is-full'
            />
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps}
              dialog={DepartmentDialog}
              dialogProps={{ department: null }}
            />
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
                        <>
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
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, rowsPerPage)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => (
            <TablePaginationComponent
              table={table}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
            />
          )}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      </Card>
      <DepartmentDialog open={open} setOpen={setOpen} department={editDepartment} />
    </>
  )
}

export default Permissions
