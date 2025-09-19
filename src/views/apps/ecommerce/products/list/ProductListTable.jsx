'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

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

import { useSelector, useDispatch } from 'react-redux'

import { Dialog, DialogActions, DialogContent } from '@mui/material'

import {
  setCurrentPage,
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectProductsPagination,
  setItemsPerPage
} from '@/redux-store/slices/products'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

  return (
    <CustomTextField {...props} className='max-sm:is-full' value={value} onChange={e => setValue(e.target.value)} />
  )
}

const productStatusObj = {
  active: { title: 'Active', color: 'success' },
  draft: { title: 'Draft', color: 'warning' },
  archived: { title: 'Archived', color: 'secondary' }
}

// Column Definitions
const columnHelper = createColumnHelper()

const ProductListTable = () => {
  const dispatch = useDispatch()

  const products = useSelector(selectProducts)
  const loading = useSelector(selectProductsLoading)
  const pagination = useSelector(selectProductsPagination)

  console.log(pagination, 'pagination')

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: pagination.page,
        limit: pagination.perPage,
        search: searchQuery,
      })
    )
  }, [dispatch, pagination.perPage, searchQuery])

  useEffect(() => {
    if (products) {
      setData(products)

      // setFilteredData(products)
    }
  }, [products])



  const handleChangePage = (event, newPage) => {
    console.log(newPage, 'newPage')
    const nextPage = newPage + 1

    dispatch(setCurrentPage(nextPage))
    dispatch(fetchProducts({ page: nextPage, limit: pagination.perPage }))

  }

  // Hooks
  const { lang: locale } = useParams()

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
      columnHelper.accessor('id', {
        enableGlobalFilter: true,
        header: 'ID',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <div className='flex flex-col'>
              <Typography variant='h6' className='cursor-default'>
                {row.original.id}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('title', {
        header: 'Product',
        enableGlobalFilter: true,
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <img
              src={row.original.image?.src}
              width={38}
              height={38}
              className='rounded bg-actionHover cursor-pointer'
              onClick={() => {
                setPreviewSrc(row.original.image?.src)
                setPreviewOpen(true)
              }}
            />
            <div className='flex flex-col'>
              <Typography variant='h6' className='cursor-default'>
                {row.original.title}
              </Typography>
              <Typography variant='body2' className='cursor-default'>
                {row.original.vendor}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        enableGlobalFilter: true,
        header: 'Category',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <Typography color='text.primary'>{row.original.category || '-'}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('stock', {
        enableGlobalFilter: true,
        header: 'Stock',
        cell: ({ row }) => <Switch defaultChecked={row.original.stock || false} />,
        enableSorting: false
      }),
      columnHelper.accessor('sku', {
        enableGlobalFilter: true,
        header: 'SKU',
        cell: ({ row }) => <Typography>{row.original.sku || '-'}</Typography>
      }),
      columnHelper.accessor('price', {
        enableGlobalFilter: true,
        header: 'Price',
        cell: ({ row }) => <Typography>{row.original.price || '-'}</Typography>
      }),
      columnHelper.accessor('qty', {
        enableGlobalFilter: true,
        header: 'QTY',
        cell: ({ row }) => <Typography>{row.original.qty || '-'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableGlobalFilter: true,
        cell: ({ row }) => {
          const statusInfo = productStatusObj[row.original.status] || { title: 'Unknown', color: 'default' }

          return <Chip label={statusInfo.title} variant='tonal' color={statusInfo.color} size='small' />
        }
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <i className='bx-edit text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                { text: 'Download', icon: 'bx-download' },
                {
                  text: 'Delete',
                  icon: 'bx-trash-alt',
                  menuItemProps: { onClick: () => setData(data?.filter(product => product.id !== row.original.id)) }
                },
                { text: 'Duplicate', icon: 'bx-copy' }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),

    // getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <div className='flex items-center justify-between flex-wrap gap-4 p-6'>
          <div className='flex gap-4'>
            <TableFilters
              onApplyFilters={filters => {
                dispatch(setCurrentPage(1)) // Reset to page 1 when filtering
                dispatch(
                  fetchProducts({
                    page: 1,
                    limit: pagination.perPage,
                    filters
                  })
                )
              }}
              onResetFilters={() => {
                dispatch(setCurrentPage(1))
                dispatch(
                  fetchProducts({
                    page: 1,
                    limit: pagination.perPage,
                    filters: {}
                  })
                )
              }}
            />
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(value) // Update local state
                // Reset to page 1 when searching
                dispatch(setCurrentPage(1))

                // Trigger API call with search
                dispatch(
                  fetchProducts({
                    page: 1,
                    limit: pagination.perPage,
                    search: value,
                    filters: {} // optional: keep or merge existing filters
                  })
                )
              }}
              placeholder='Search Product'
            />
          </div>
          <div className='flex sm:items-center flex-wrap max-sm:flex-col max-sm:is-full gap-4'>
            <CustomTextField
              select
              value={pagination.perPage}
              onChange={e => {
                const newSize = Number(e.target.value)

                dispatch(setItemsPerPage(newSize))
                dispatch(setCurrentPage(1)) // reset to first page
              }}
              className='flex-auto is-full sm:is-[80px]'
            >
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </CustomTextField>
            <Button color='secondary' variant='tonal' startIcon={<i className='bx-export' />}>
              Export
            </Button>
            <Button
              variant='contained'
              component={Link}
              href={getLocalizedUrl('/apps/ecommerce/products/add', locale)}
              startIcon={<i className='bx-plus' />}
            >
              Add Product
            </Button>
          </div>
        </div>
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
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePaginationComponent
          table={table}
          count={pagination.total}
          rowsPerPage={pagination.perPage}
          page={pagination?.page ? pagination.page - 1 : 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={event => {
            const newLimit = parseInt(event.target.value, 10)

            dispatch(setItemsPerPage(newLimit))
            dispatch(setCurrentPage(1)) // Reset to first page when changing page size
          }}
        />
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth='md'>
          <DialogContent sx={{ p: 0 }}>
            <img src={previewSrc} alt='Preview' style={{ maxWidth: '50vw', height: '50vh', display: 'block' }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)} color='primary' variant='contained'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default ProductListTable
