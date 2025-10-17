'use client'
import { useState, useMemo, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useSelector, useDispatch } from 'react-redux'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'

import { DatePicker, Space } from 'antd'

const { RangePicker } = DatePicker

import classnames from 'classnames'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues
} from '@tanstack/react-table'
import {
  Alert,
  Autocomplete,
  DialogActions,
  InputAdornment,
  Snackbar,
  TextField,
  MenuItem,
  Drawer,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from '@mui/material'

import { rankItem } from '@tanstack/match-sorter-utils'
import dayjs from 'dayjs'
import cities from '@/data/cities/cities'

// import { DateRangePicker } from '@mui/lab'

import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

import TagEditDialog from '@/components/tagEdit/TagEditDialog'

import {
  cancelAwb,
  courierAssignment,
  downloadLoadSheet,
  fetchBookingOrder,
  fetchBookingOrders,

  // updateOrderCommentsAndRemarks,
  selectBookingOrdersPagination

  // updateOrdersStatusThunk
} from '@/redux-store/slices/bookingSlice'

import {
  fetchCouriers,
  selectCouriers,
  selectActiveCouriers,
  selectCouriersLoading
} from '@/redux-store/slices/couriers'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import EditCourierInfo from '@components/dialogs/edit-courier-info'

// import FilterModal from '../filterModal/page'

// Utils
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles
import tableStyles from '@core/styles/table.module.css'
import AmountRangePicker from '@/components/amountRangePicker/AmountRangePicker'
import StatusCell from '@/components/statusCell/StatusCell'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import OrderDetails from '@/views/apps/ecommerce/orders/details'
import { postRequest } from '@/utils/api'
import ConfirmationDialog from '../dialogs/confirmation-dialog'
import {
  addPartialPaymentThunk,
  changeCityThunk,
  updateOrderAddressThunk,
  updateOrderCommentsAndRemarks,
  updateOrderRemarksThunk,
  updateOrdersStatusThunk
} from '@/redux-store/slices/order'

/* ---------------------------- helper maps --------------------------- */
export const paymentStatus = {
  paid: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  pending: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  cancelled: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  failed: { text: 'Failed', color: 'error', colorClassName: 'text-error' },
  partially_paid: { text: 'Partially Paid', color: 'info', colorClassName: 'text-info' }
}

// export const orderPlatform = {
//   shopify: { text: 'Shopify', color: 'success', colorClassName: 'text-success' },
//   whatsapp: { text: 'Whatsapp', color: 'secondary', colorClassName: 'text-secondary' },
//   split: { text: 'Split', color: 'warning', colorClassName: 'text-warning' }
// }

export const courierPlatforms = {
  // none: { text: 'None', color: 'default', colorClassName: 'text-default' },
  leopard: { text: 'Leopards', color: 'success', colorClassName: 'text-success' }

  // daewoo: { text: 'Daewoo', color: 'secondary', colorClassName: 'text-secondary' },
  // postEx: { text: 'PostEx', color: 'warning', colorClassName: 'text-warning' },
  // mp: { text: 'M&P', color: 'error', colorClassName: 'text-error' },
  // tcs: { text: 'TCS', color: 'primary', colorClassName: 'text-primary' }
}

export const statusChipColorForBooking = {
  confirmed: { color: 'success', text: 'Confirmed' },
  processing: { color: 'info', text: 'Processing' },
  onWay: { color: 'warning', text: 'On Way' }
}

export const orderStatusArray = Object.keys(statusChipColorForBooking).map(key => ({
  value: key,
  label: statusChipColorForBooking[key].text
}))

export const tagsArray = [
  { value: 'Urgent delivery', label: 'Urgent delivery' },
  { value: 'Allowed to Open', label: 'Allowed to Open' },
  { value: 'Deliver between (specific date and Time)', label: 'Deliver between (specific date and Time)' },
  { value: 'Call before reaching', label: 'Call before reaching' },
  { value: 'Deliver parcel to the  (specific person)', label: 'Deliver parcel to the  (specific person)' },
  {
    value: 'Do not deliver to anyone except the mentioned consignee name',
    label: 'Do not deliver to anyone except the mentioned consignee name'
  },
  { value: 'Deliver without call', label: 'Deliver without call' },
  { value: 'Product must not be visible-consider privacy', label: 'Product must not be visible-consider privacy' }
]

const chipColors = ['primary', 'secondary', 'success', 'warning', 'info', 'error']

export const PartialPaymentInlineDialog = ({ open, setOpen, orderId, onSuccess }) => {
  const dispatch = useDispatch()
  const [amount, setAmount] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleSubmit = async () => {
    if (!amount) return
    setLoading(true)

    try {
      let attachmentUrl = null

      if (attachment) {
        try {
          const uploadResult = await dispatch(uploadAttachmentThunk(attachment)).unwrap()

          attachmentUrl = uploadResult.url || uploadResult.secureUrl
        } catch (err) {
          console.error('Attachment upload failed:', err)
          setLoading(false)
          return
        }
      }

      const payload = {
        id: orderId,
        amount: Number(amount) || 0
      }

      if (attachmentUrl) payload.attachment = attachmentUrl

      await dispatch(addPartialPaymentThunk(payload))
        .unwrap()
        .then(async () => {
          setSnackbar({ open: true, message: 'Partial payment added successfully', severity: 'success' })
          await dispatch(fetchBookingOrders({ page: 1, limit: 50, force: true })).unwrap()
        })
        .catch(err => {
          console.error('Partial payment failed:', err)
          setSnackbar({ open: true, message: 'Failed to add partial payment', severity: 'error' })
        })

      setOpen(false)
      setAmount('')
      setAttachment(null)
      onSuccess?.()
    } catch (err) {
      console.error('Partial payment failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Add Partial Payment</DialogTitle>
        <DialogContent className='pt-2'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              required
              type='number'
              label='How much (amount)'
              value={amount}
              onChange={e => setAmount(e.target.value)}
              inputProps={{ min: 0, step: '1' }}
            />

            <Button variant='outlined' component='label' startIcon={<i className='bx bx-paperclip' />}>
              Upload attachment (proof)
              <input
                type='file'
                hidden
                accept='image/*,application/pdf'
                onChange={e => setAttachment(e.target.files?.[0] || null)}
              />
            </Button>

            {attachment ? <Typography variant='body2'>{attachment.name}</Typography> : null}
          </div>
        </DialogContent>

        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!amount || loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert variant='filled' severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

function convertCities(cities = []) {
  return cities.reduce((acc, name, index) => {
    if (!name) return acc

    const key = name.toLowerCase().replace(/\s+/g, '_')

    acc[key] = {
      text: name,
      color: chipColors[index % chipColors.length], // rotate colors
      colorClassName: `text-${chipColors[index % chipColors.length]}`
    }

    return acc
  }, {})
}

export const pakistanCities = convertCities(cities)

const getTagColor = tag => {
  if (!tag) return 'default'
  const hash = [...tag].reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return chipColors[hash % chipColors.length]
}

const cityOptions = (cities || []).map(c =>
  typeof c === 'string'
    ? { label: c, value: c }
    : { label: c?.name || c?.label || '', value: c?.value || c?.name || c?.label || '' }
)

const mapFiltersToApiFormat = localFilters => {
  const apiFilters = {}

  // Amount filters
  if (localFilters.minAmount) apiFilters.amountMin = localFilters.minAmount
  if (localFilters.maxAmount) apiFilters.amountMax = localFilters.maxAmount

  if (localFilters.paymentMethods && localFilters.paymentMethods.length > 0) {
    apiFilters.paymentMethod = localFilters.paymentMethods[0].value
  }

  if (localFilters.paymentStatus && localFilters.paymentStatus.length > 0) {
    apiFilters.paymentStatus = localFilters.paymentStatus[0].value
  }

  // Date filters (you need to add startDate/endDate to your filters state)
  // we have order_start_date and order_end_date in the backend
  if (localFilters.startDate) {
    apiFilters.dateFrom = dayjs(localFilters.startDate).format('YYYY-MM-DD')
  }

  if (localFilters.endDate) {
    apiFilters.dateTo = dayjs(localFilters.endDate).format('YYYY-MM-DD')
  }

  // Status filters - you need to decide which one to use
  if (localFilters.orderStatus && localFilters.orderStatus.length > 0) {
    apiFilters.status = localFilters.orderStatus[0].value
  }

  // Platform filters
  if (localFilters.courierPlatforms?.length > 0) {
    apiFilters.courierPlatforms = localFilters.courierPlatforms.map(item => item.value) // or join them
  }

  if (localFilters.pakistanCities && localFilters.pakistanCities.length > 0) {
    apiFilters.city = localFilters.pakistanCities[0].value
  }

  if (localFilters.tags && localFilters.tags.length > 0) {
    apiFilters.tags = localFilters.tags.map(c => c.value).join(',')
  }

  return apiFilters
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta?.({ itemRank })

  return itemRank.passed
}

export const paymentMethodsMap = {
  cod: { text: 'COD' },
  wallet: { text: 'Wallet' }
}

export const normalizePaymentMethod = (names = []) => {
  const label = (names[0] || '').toLowerCase()

  if (label.includes('cod') || label.includes('cash on delivery (cod)') || label.includes('cash on delivery'))
    return 'cod'
  if (label.includes('paypal')) return 'paypal'
  if (label.includes('mastercard') || label.includes('visa') || label.includes('card')) return 'card'
  if (label.includes('wallet')) return 'wallet'

  return 'other'
}

// const fuzzyFilter = (row, columnId, value, addMeta) => {
//   const itemRank = rankItem(row.getValue(columnId), value)

//   addMeta({ itemRank })

//   return itemRank.passed
// }

/* -------------------------- small components ------------------------ */
const DebouncedInput = ({ value: initialValue, onChange, debounce = 1000, onEnter, ...props }) => {
  const [value, setValue] = useState(initialValue ?? '')

  useEffect(() => {
    setValue(initialValue ?? '')
  }, [initialValue])

  useEffect(() => {
    const t = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(t)
  }, [value, debounce, onChange])

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEnter?.(value)
        }
      }}
    />
  )
}

/* --------------------------- main component ------------------------- */
const BookingListTable = ({
  orderData = [],
  loading = false,
  error = null,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFiltersChange
}) => {
  const { lang: locale } = useParams()
  const dispatch = useDispatch()
  const pagination = useSelector(selectBookingOrdersPagination)

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' })
  const [editCourierData, setEditCourierData] = useState({ open: false, courier: null, remarks: '' })

  const [tagsMap, setTagsMap] = useState({})

  // Local UI state
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [loadings, setLoadings] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const couriers = useSelector(selectCouriers)

  const activeCouriers = useSelector(selectActiveCouriers)?.map(courier => ({
    label: courier.name,
    value: courier.id,
    id: courier.id
  }))

  const courierLoading = useSelector(selectCouriersLoading)

  useEffect(() => {
    if (!couriers.length && !courierLoading) {
      dispatch(fetchCouriers({ active: true, force: true }))
    }
  }, [])

  const [tagModal, setTagModal] = useState({
    open: false,
    orderId: null,
    tags: []
  })

  // Right-side details drawer state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsOrderId, setDetailsOrderId] = useState(null)

  const openDetails = id => {
    setDetailsOrderId(id)
    setDetailsOpen(true)
  }

  const openTagEditor = (orderId, currentTags = []) => {
    const tag = Array.isArray(currentTags) ? (currentTags[0] ?? '') : (currentTags ?? '')

    setTagModal({ open: true, orderId, tags: [tag].filter(Boolean) })
  }

  const closeTagEditor = () => setTagModal({ open: false, orderId: null, tags: [] })

  const updateOrdersStatus = async (orderIds, newStatus) => {
    try {
      // Ensure orderIds is always an array
      const idsArray = Array.isArray(orderIds) ? orderIds : [orderIds]

      const result = await dispatch(
        updateOrdersStatusThunk({
          orderIds: idsArray,
          status: newStatus
        })
      ).unwrap()

      // Success message
      const count = idsArray.length

      const message =
        result.message ||
        `Status updated to "${statusChipColorForBooking[newStatus]?.text}" for ${count} order${count > 1 ? 's' : ''}`

      setAlert({
        open: true,
        message,
        severity: 'success'
      })

      // Clean up UI state only if it was a bulk operation
      if (selectedIds.length > 0) {
        setStatusMenuAnchor(null)
        setRowSelection({})
      }

      // Refresh data
      dispatch(fetchBookingOrders({ page: pagination.currentPage, limit, force: true, filters: emptyFilters }))
      await setFilters(emptyFilters)

      // dispatch(updateOrdersStatus({ id: idsArray, status: newStatus}))
    } catch (error) {
      // Clean up UI state only if it was a bulk operation
      if (selectedIds.length > 0) {
        setStatusMenuAnchor(null)
        setRowSelection({})
      }

      setAlert({
        open: true,
        message: error.message || error || 'Failed to update order status',
        severity: 'error'
      })
    }
  }

  const handleSingleStatusChange = (orderId, newStatus) => updateOrdersStatus(orderId, newStatus)
  const handleBulkStatusChange = newStatus => updateOrdersStatus(selectedIds, newStatus)

  const onSubmitPartial = async ({ orderId, amount, attachment }) => {
    try {
      await dispatch(addPartialPaymentThunk({ id: orderId, amount, attachment })).unwrap()
      setAlert({ open: true, message: 'Partial payment recorded.', severity: 'success' })
      return true
    } catch (err) {
      setAlert({ open: true, message: err || 'Failed to record partial payment.', severity: 'error' })
      return false
    }
  }

  const dateRangeFilterFn = (row, columnId, filterValue) => {
    const rowDate = new Date(row.getValue(columnId))
    const from = filterValue.from ? new Date(filterValue.from) : null
    const to = filterValue.to ? new Date(filterValue.to) : null

    if (from && rowDate < from) return false
    if (to && rowDate > to) return false

    return true
  }

  const amountRangeFilterFn = (row, columnId, filterValue) => {
    const amount = Number(row.getValue(columnId))
    const min = filterValue.min !== '' ? Number(filterValue.min) : null
    const max = filterValue.max !== '' ? Number(filterValue.max) : null

    if (min !== null && amount < min) return false
    if (max !== null && amount > max) return false

    return true
  }

  // fetch Active Couriers courier platforms from the redux

  // Map backend orders -> table rows
  const data = useMemo(() => {
    return (orderData || []).map(order => {
      const names = Array.isArray(order.payment_gateway_names)
        ? order.payment_gateway_names
        : order.payment_gateway_names
          ? [order.payment_gateway_names]
          : []

      let shortFormNames = names.map(name => {
        if (name === 'Cash on Delivery (COD)') {
          return 'cod'
        }

        return name
      })

      const parsedTags = Array.isArray(order.tags)
        ? order.tags.flatMap(t =>
            String(t)
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          )
        : typeof order.tags === 'string'
          ? order.tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : []

      // ✅ Remove duplicates and empty strings
      const uniqueTags = Array.from(new Set(parsedTags.filter(Boolean)))

      const addressObj = Array.isArray(order.address) && order.address.length > 0 ? order.address[0] : {}
      const fullAddress = addressObj.address1 || addressObj.address2 || ''

      return {
        id: order.id,
        orderNumber: order?.name?.replace('#', ''),
        date: order.created_at,
        time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customer: `${order?.first_name || ''} ${order?.last_name || ''}`.trim(),
        customerId: order?.customer,

        // dispatchStatus: order.courier?.dispatchStatus,
        email: order.email,
        payment: order.financial_status?.toLowerCase() || 'pending',
        platform: order.courier?.name || 'none', // note: lowercase 'platform'
        status: order.orderStatus,

        // status: order?.courier?.dispatchStatus === 'cancelled' ? 'cancelled' : order.orderStatus,
        awb: order.courier?.awbLink || '',
        method: normalizePaymentMethod(shortFormNames),
        remarks: order.remarks,
        methodLabel: names[0] || 'Unknown',
        trackNumber: order.courier?.trackNumber || '',
        Amount: Number(order.current_total_price),
        city: order?.city || '',
        address: fullAddress,
        phone: addressObj.phone || '',
        tags: uniqueTags,
        totalOrders: order?.totalOrdersByCustomer || 0,
        successfulOrders: order?.completedOrdersByCustomer || 0,
        lastOrderStatus: order?.lastOrderStatus || 0
      }
    })
  }, [orderData])

  // const getAvatar = ({ avatar, customer }) => {
  //   const initials = getInitials(customer)

  //   if (avatar) return <CustomAvatar src={avatar} skin='light' size={34} />

  //   if (initials) {
  //     return (
  //       <CustomAvatar skin='light' size={34} className='bg-primary text-white'>
  //         {initials}
  //       </CustomAvatar>
  //     )
  //   }

  //   return (
  //     <CustomAvatar skin='light' size={34} className='bg-primary text-white'>
  //       <i className='bx-user' />
  //     </CustomAvatar>
  //   )
  // }

  const handleSaveTags = async newTag => {
    const tagPayload = String(newTag || '').trim()

    if (!tagPayload) {
      setAlert({ open: true, message: 'Tag cannot be empty.', severity: 'error' })
      return
    }

    const orderId = tagModal.orderId

    if (!orderId) return

    try {
      setLoadings(true)

      // ✅ Get previous tags from tagsMap OR from orderData
      const previousTags = tagsMap[orderId] ?? orderData.find(order => order.id === orderId)?.tags ?? []

      // ✅ Push new tag, ensuring uniqueness
      const updatedTags = Array.from(new Set([...previousTags, tagPayload].map(t => String(t).trim()).filter(Boolean)))

      // ✅ Update UI immediately
      setTagsMap(prev => ({
        ...prev,
        [orderId]: updatedTags
      }))

      // ✅ Send clean comma-separated string to backend
      await dispatch(
        updateOrderCommentsAndRemarks({
          orderId,
          tags: updatedTags.join(',')
        })
      ).unwrap()

      setAlert({
        open: true,
        message: 'Tag updated successfully.',
        severity: 'success'
      })
      closeTagEditor()
    } catch (err) {
      setAlert({
        open: true,
        message: err?.message || 'Failed to update tag.',
        severity: 'error'
      })
    } finally {
      setLoadings(false)
    }
  }

  const updateAddressApi = async ({ id, address }) => {
    // TODO: Implement API call here, e.g. await api.updateOrderAddress({ id, address })
    // Intentionally left blank per request
    await dispatch(updateOrderAddressThunk({ id, address })).unwrap()
  }

  const updateRemarksApi = async ({ id, remarks }) => {
    // TODO: Implement API call here, e.g. await api.updateOrderAddress({ id, address })
    // Intentionally left blank per request
    await dispatch(updateOrderCommentsAndRemarks({ orderId: id, remarks })).unwrap()
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          return (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          )
        },
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
        accessorKey: 'orderNumber',
        id: 'order',
        header: 'Order #',
        cell: ({ row }) => (
          <Typography
            component='button'
            onClick={() => openDetails(row.original.id)}
            color='primary.main'
            className='cursor-pointer bg-transparent border-0 p-0'
          >
            #{row.original.orderNumber || '—'}
          </Typography>
        )
      },
      {
        accessorKey: 'date',
        header: 'Date',
        filterFn: dateRangeFilterFn,
        cell: ({ row }) => {
          const dateObj = new Date(row.original.date)
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })

          const monthDateYear = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })

          return (
            <Typography component='div'>
              <div>{monthDateYear}</div>
              <div>{`${dayName}, ${row.original.time || '—'}`}</div>
            </Typography>
          )
        }
      },

      // {
      //   accessorKey: 'customer',
      //   header: 'Customer Name',
      //   meta: { width: '250px' },
      //   cell: ({ row }) => (
      //     <div className='flex items-center gap-3'>
      //       {getAvatar(row.original)}
      //       <div className='flex flex-col'>
      //         <Typography
      //           variant='h6'
      //           component={Link}
      //           href={getLocalizedUrl(`/apps/ecommerce/customers/details/${row.original.customerId}`, locale)}
      //           className='hover:text-primary'
      //         >
      //           {row.original.customer || '—'}
      //         </Typography>
      //         <Typography variant='body2'>{row.original.email || '—'}</Typography>
      //       </div>
      //     </div>
      //   )
      // },
      {
        accessorKey: 'payment',
        header: 'Payment Status',
        meta: { width: '200px' },
        cell: ({ row }) => {
          const isPending = String(row.original.payment).toLowerCase() === 'pending'

          return (
            <div className='flex items-center gap-2'>
              {isPending ? (
                <>
                  {/* <Menu
                    open={false}
                    anchorEl={null}
                    // Placeholder to keep imports happy; real menu shown via inline trigger below
                  /> */}
                  <OpenDialogOnElementClick
                    element={IconButton}
                    elementProps={{
                      // size: 'small',
                      className: 'hover:rounded-4xl',
                      children: (
                        <Typography
                          className={`font-medium ${paymentStatus[row.original.payment]?.colorClassName || 'text-default'}`}
                        >
                          {paymentStatus[row.original.payment]?.text || row.original.payment || 'Unknown'}
                        </Typography>
                      )
                    }}
                    dialog={PartialPaymentInlineDialog}
                    dialogProps={{ onSubmitPartial, orderId: row.original.id }}
                  />
                </>
              ) : (
                <OpenDialogOnElementClick
                  element={IconButton}
                  elementProps={{
                    // size: 'small',
                    className: 'hover:rounded-4xl',
                    children: (
                      <Typography
                        className={`font-medium ${paymentStatus[row.original.payment]?.colorClassName || 'text-default'}`}
                      >
                        {paymentStatus[row.original.payment]?.text || row.original.payment || 'Unknown'}
                      </Typography>
                    )
                  }}
                  dialog={PartialPaymentInlineDialog}
                  dialogProps={{ onSubmitPartial, orderId: row.original.id }}
                />
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'courier',
        header: 'Courier',
        cell: ({ row }) => {
          const courierName = row.original.platform?.toLowerCase() || 'unknown'

          const couriers = activeCouriers.map(c => ({ id: c.id, label: c.label || c.value, value: c.value }))

          console.log(courierName, 'courierName')

          const displayName = couriers?.label || row.original.platform || 'Unknown'

          return (
            <OpenDialogOnElementClick
              element={Chip}
              elementProps={{
                label: displayName,
                variant: 'outlined',
                size: 'small',
                className: 'cursor-pointer'
              }}
              dialog={EditCourierInfo}
              dialogProps={{
                data: {
                  orderIds: [row.original.id],
                  courier: displayName,
                  reason: ''
                },
                onSubmit: async (payload, controls) => {
                  try {
                    const { orderIds, courier, reason } = payload
                    const selectedCourier = activeCouriers.find(c => c.value === courier)

                    console.log(selectedCourier, 'selectedCourier')

                    if (!selectedCourier?.value) {
                      setAlert({
                        open: true,
                        message: 'Please select a valid courier before submitting.',
                        severity: 'error'
                      })
                      return
                    }

                    const body = {
                      orderId: [row.original.id],
                      courier: selectedCourier?.value, // name (since backend expects name)
                      reason
                    }

                    const res = await dispatch(courierAssignment(body)).unwrap()

                    setAlert({
                      open: true,
                      message: res?.message || 'Courier updated',
                      severity: 'success'
                    })
                    controls?.close()
                    controls?.reset()

                    await dispatch(
                      fetchBookingOrders({
                        page: pagination.currentPage,
                        limit: pagination.itemsPerPage,
                        force: true
                      })
                    )
                  } catch (err) {
                    setAlert({
                      open: true,
                      message: err?.message || 'Failed to assign courier',
                      severity: 'error'
                    })
                  } finally {
                    controls?.done?.()
                  }
                }
              }}
            />
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Order Status',
        cell: props => {
          return <StatusCell {...props} onStatusChange={handleSingleStatusChange} booking />
        }
      },
      {
        accessorKey: 'method',
        header: 'Method',
        meta: { width: '250px' },
        cell: ({ row }) => {
          const m = row.original.method
          const label = row.original.methodLabel

          const iconClass =
            m === 'card'
              ? 'bx-credit-card'
              : m === 'paypal'
                ? 'bxl-paypal'
                : m === 'cod'
                  ? 'bx-money'
                  : m === 'wallet'
                    ? 'bx-wallet'
                    : 'bx-purchase-tag-alt'

          // const rightText = m === 'card' ? row.original.methodNumber || label : label

          return (
            <div className='flex items-center gap-2'>
              <div className='flex justify-center items-center bg-[#F6F8FA] rounded-sm is-[29px] bs-[18px]'>
                <i className={`${iconClass} text-[18px]`} />
              </div>
              <Typography className='font-medium'>{m.toUpperCase()}</Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        meta: { width: '200px' },
        cell: ({ row }) => {
          const initialRemarks =
            typeof row.original.remarks === 'string'
              ? row.original.remarks
              : Array.isArray(row.original.remarks)
                ? row.original.remarks.join(', ')
                : ''

          const [value, setValue] = useState(initialRemarks)
          const [original, setOriginal] = useState(initialRemarks)
          const [updating, setUpdating] = useState(false)
          const hasExistingRemark = original.trim() !== ''

          useEffect(() => {
            const next =
              typeof row.original.remarks === 'string'
                ? row.original.remarks
                : Array.isArray(row.original.remarks)
                  ? row.original.remarks.join(', ')
                  : ''

            setValue(next)
            setOriginal(next)
          }, [row.original.remarks])

          const handleBlur = async () => {
            const trimmed = String(value || '').trim()
            const prev = String(original || '').trim()

            if (trimmed === prev) return

            try {
              setUpdating(true)
              await updateRemarksApi({ id: row.original.id, remarks: trimmed })
              setOriginal(trimmed)

              // optional: show success snackbar if you have global one
              // setSnackbar({ open: true, message: 'Remarks updated successfully', severity: 'success' })
            } catch (err) {
              // optional: show error snackbar
              // setSnackbar({ open: true, message: 'Failed to update remarks', severity: 'error' })
            } finally {
              setUpdating(false)
            }
          }

          return (
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={handleBlur}
              disabled={updating || hasExistingRemark}
              rows={2}
              className={`bg-transparent border-0 outline-none w-[200px] text-gray-800 resize-none break-words no-scrollbar ${
                updating ? 'opacity-60' : ''
              } ${hasExistingRemark ? 'cursor-not-allowed text-gray-500' : ''}`}
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                fontWeight: 'inherit'
              }}
              placeholder='—'
            />
          )
        }
      },
      {
        accessorKey: 'address',
        header: 'Address',
        meta: { width: '450px' },
        cell: ({ row }) => {
          const initialAddress = row.original.address || ''
          const [value, setValue] = useState(initialAddress)
          const [original, setOriginal] = useState(initialAddress)
          const [updating, setUpdating] = useState(false)

          useEffect(() => {
            const next = row.original.address || ''

            setValue(next)
            setOriginal(next)
          }, [])

          return (
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={async () => {
                const trimmed = String(value || '').trim()
                const prev = String(original || '').trim()

                if (trimmed !== prev) {
                  await updateAddressApi({ id: row.original.id, address: trimmed })
                  setOriginal(trimmed)
                }
              }}
              rows={2}
              className={`bg-transparent border-0 outline-none w-[250px] text-gray-800 resize-none whitespace-pre-wrap break-words no-scrollbar ${updating ? 'opacity-60' : ''}`}
              style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', fontWeight: 'inherit' }}
              placeholder='—'
            />
          )
        }
      },
      {
        accessorKey: 'total&successfulOrders',
        header: 'Total & Successful Orders',
        meta: { width: '250px' },
        cell: ({ row }) => {
          // const totalAndSuccessfulOrders = row.original?.totalOrders + row.original?.successfulOrders

          return (
            <Typography className='font-medium text-gray-800'>
              {row.original.totalOrders + ' : ' + row.original.successfulOrders || '—'}
            </Typography>
          )
        }
      },
      {
        accessorKey: 'lastOrderStatus',
        header: 'Last Order Status',
        meta: { width: '250px' },
        cell: ({ row }) => {
          const lastOrderStatus = row.original?.lastOrderStatus

          return (
            <Chip
              variant='tonal'
              color={getTagColor(lastOrderStatus)}
              className='font-medium text-gray-800'
              label={lastOrderStatus || '—'}
            ></Chip>
          )
        }
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        meta: { width: '250px' },
        cell: ({ row }) => {
          const originalTags = Array.isArray(row.original.tags)
            ? row.original.tags
            : row.original.tags
              ? [row.original.tags]
              : []

          const displayedTags = tagsMap[row.original.id] ?? originalTags
          const hasTags = displayedTags && displayedTags.length > 0

          return (
            <div className='flex flex-col gap-1'>
              {/* First row: Tags */}
              <div
                className='flex flex-col gap-2 cursor-default max-w-40 w-full overflow-scroll no-scrollbar'

                // onClick={() => openTagEditor(row.original.id, displayedTags)}
                role='button'
                tabIndex={0}

                // onKeyDown={e => {
                //   if (e.key === 'Enter') openTagEditor(row.original.id, displayedTags)
                // }}
              >
                {hasTags ? (
                  displayedTags.map((tag, i) => (
                    <Chip key={i} label={tag} color={getTagColor(tag)} variant='tonal' size='small' />
                  ))
                ) : (
                  <> </>
                )}
              </div>

              {/* Second row: "+" button */}
              <div>
                <Chip
                  label='+ Add Tag'
                  variant='outlined'
                  size='small'
                  onClick={() => openTagEditor(row.original.id, displayedTags)}
                />
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'Amount',
        header: 'Amount',
        filterFn: amountRangeFilterFn,
        cell: ({ row }) => (
          <Typography className='font-medium text-gray-800'>
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(row.original.Amount || '—')}
          </Typography>
        )
      },
      {
        accessorKey: 'city',
        header: 'City',
        meta: { width: '180px' },
        cell: ({ row }) => {
          const city = row.original.city
          const [open, setOpen] = useState(false)
          const [selectedCity, setSelectedCity] = useState(null)
          const [submitting, setSubmitting] = useState(false)
          const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

          const normalizedCity = typeof city === 'string' ? city : city?.label || ''

          const onSubmit = async () => {
            if (!selectedCity?.label) return

            try {
              setSubmitting(true)
              await dispatch(changeCityThunk({ id: row.original.id, city: selectedCity.label }))
              await dispatch(fetchBookingOrders({ page: 1, limit: 50, force: true })).unwrap()
              setSnackbar({ open: true, message: 'City updated successfully', severity: 'success' })
            } catch (error) {
              setSnackbar({ open: true, message: 'Failed to update city', severity: 'error' })
            } finally {
              setSubmitting(false)
              setOpen(false)
            }
          }

          return (
            <>
              <Typography
                className='font-medium text-gray-800 cursor-pointer hover:text-primary'
                onClick={() => {
                  setSelectedCity(
                    selectedCity || (normalizedCity ? { label: normalizedCity, value: normalizedCity } : null)
                  )
                  setOpen(true)
                }}
              >
                {normalizedCity || '—'}
              </Typography>

              <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'>
                <DialogTitle>Select City</DialogTitle>
                <DialogContent className='pt-2'>
                  <Autocomplete
                    fullWidth
                    options={cityOptions}
                    value={selectedCity}
                    onChange={(_e, newValue) => setSelectedCity(newValue)}
                    getOptionLabel={option => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={params => (
                      <TextField {...params} fullWidth label='City' placeholder='Search cities and select' />
                    )}
                  />
                </DialogContent>
                <DialogActions>
                  <Button variant='tonal' color='secondary' onClick={() => setOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button variant='contained' onClick={onSubmit} disabled={!selectedCity?.label || submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </DialogActions>
              </Dialog>

              <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert severity={snackbar.severity} variant='filled'>
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </>
          )
        }
      },
      {
        accessorKey: 'awb',
        header: 'Airway Bill',
        meta: { width: '250px' },
        cell: ({ row }) => {
          // if (row.original?.status === 'cancelled') {
          //   return <Chip label='Cancelled' variant='outlined' size='small' />
          // }

          if (row.original.platform === 'none') {
            return (
              <OpenDialogOnElementClick
                element={Chip}
                elementProps={{
                  label: 'Assign',
                  variant: 'outlined',
                  size: 'small',
                  className: 'cursor-pointer w-full'
                }}
                dialog={EditCourierInfo}
                dialogProps={{
                  data: (() => {
                    const firstSelected = table.getSelectedRowModel().flatRows[0]?.original

                    const inferCourierKey = name => {
                      if (!name) return 'none'
                      const n = String(name).toLowerCase()

                      if (n.includes('leopard')) return 'leopard'

                      // if (n.includes('daewoo')) return 'daewoo'
                      // if (n.includes('post')) return 'postEx'
                      // if (n.includes('m&p') || n.includes('mp')) return 'mp'
                      // if (n.includes('tcs')) return 'tcs'
                      return 'none'
                    }

                    const defaultCourier = inferCourierKey(firstSelected?.platform)

                    return {
                      orderIds: selectedIds.length > 0 ? selectedIds : [row.original.id],
                      courier: defaultCourier,
                      reason: ''
                    }
                  })(),
                  onSubmit: async (payload, controls) => {
                    try {
                      const courierApiMap = {
                        // none: 'None',
                        leopard: 'Leopard'

                        // daewoo: 'Daewoo',
                        // postEx: 'PostEx',
                        // mp: 'M&P',
                        // tcs: 'TCS'
                      }

                      const freshSelectedIds = (() => {
                        const ids = table.getSelectedRowModel().flatRows.map(r => r.original.id)

                        return ids.length > 0 ? ids : [row.original.id]
                      })()

                      const body = {
                        orderId: freshSelectedIds.map(id => String(id)),
                        courier: courierApiMap[payload.courier] || payload.courier,
                        reason: payload.reason
                      }

                      const res = await dispatch(courierAssignment(body)).unwrap()

                      setAlert({ open: true, message: res?.message || 'Courier updated', severity: 'success' })
                      controls?.close()
                      controls?.reset()
                      setRowSelection({})

                      await dispatch(
                        fetchBookingOrders({
                          page: pagination.currentPage,
                          limit: pagination.itemsPerPage,
                          force: true
                        })
                      )
                    } catch (err) {
                      setAlert({ open: true, message: err?.message || 'Failed to assign courier', severity: 'error' })
                      setRowSelection({})
                    } finally {
                      controls?.done?.()
                      setRowSelection({})
                    }
                  }
                }}
              />
            )
          }

          if (row.original.awb) {
            return (
              <div className='flex flex-col gap-1'>
                <OpenDialogOnElementClick
                  element={Chip}
                  elementProps={{ label: 'Cancel', variant: 'outlined', size: 'small', className: 'cursor-pointer' }}
                  dialog={ConfirmationDialog}
                  dialogProps={{
                    type: 'cancel-awb',
                    payload: { trackNumbers: [row.original.trackNumber] },
                    onSuccess: async ({ trackNumbers }) => {
                      try {
                        const res = await dispatch(cancelAwb({ trackNumber: trackNumbers })).unwrap()

                        setAlert({ open: true, message: res?.message || 'AWB cancelled', severity: 'success' })
                        await dispatch(
                          fetchBookingOrders({
                            page: pagination.currentPage,
                            limit: pagination.itemsPerPage,
                            force: true
                          })
                        )
                      } catch (e) {
                        setAlert({ open: true, message: e?.message || 'Failed to cancel AWB', severity: 'error' })
                      }
                    }
                  }}
                />
                <Chip
                  label='View'
                  variant='outlined'
                  size='small'
                  onClick={() => window.open(row.original.awb, '_blank')}
                />
              </div>
            )
          }

          return (
            <div className='flex flex-col gap-1'>
              <OpenDialogOnElementClick
                element={Chip}
                elementProps={{ label: 'Create', variant: 'outlined', size: 'small', className: 'cursor-pointer' }}
                dialog={ConfirmationDialog}
                dialogProps={{ type: 'generate-airway-bill', payload: { orderIds: [row.original.id] } }}
                onSuccess={async () => {
                  try {
                    // Refresh bookings list
                    dispatch(
                      fetchBookingOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage, force: true })
                    )
                  } catch (e) {
                    setAlert({ open: true, message: e?.message || 'Failed to generate AWB', severity: 'error' })
                  }
                }}
              />
            </div>
          )
        }
      },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium', className: 'text-textSecondary' }}
              options={[
                {
                  text: 'View',
                  icon: 'bx-show',
                  menuItemProps: {
                    onClick: () => openDetails(row.original.id),
                    className: 'flex items-center gap-2 is-full plb-2 pli-5'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    [activeCouriers, locale, tagsMap]
  )

  const [filters, setFilters] = useState({
    paymentMethods: [],
    paymentStatus: [],
    courierPlatforms: [],
    orderStatus: [],
    city: [],
    tags: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })

  const paymentMethodsArray = Object.keys(paymentMethodsMap).map(key => ({
    value: key,
    label: paymentMethodsMap[key].text
  }))

  const courierPlatformsArray = Object.keys(courierPlatforms).map(key => ({
    value: key,
    label: courierPlatforms[key].text
  }))

  const paymentStatusArray = Object.keys(paymentStatus).map(key => ({
    value: key,
    label: paymentStatus[key].text
  }))

  const citiesArray = Object.keys(pakistanCities).map(key => ({
    value: key,
    label: pakistanCities[key].text
  }))

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true

    // pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : -1,
    // onPaginationChange: updater => {
    //   const current = { pageIndex: Math.max(0, page - 1), pageSize: limit || 25 }
    //   const next = typeof updater === 'function' ? updater(current) : updater
    //   const nextPage = (next.pageIndex ?? current.pageIndex) + 1
    //   const nextSize = next.pageSize ?? current.pageSize

    //   if (nextPage !== page) {
    //     onPageChange?.(nextPage)
    //   }

    //   if (nextSize !== limit) {
    //     onLimitChange?.(nextSize)
    //   }
    // }
  })

  const selectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])
  const selectedIds = table.getSelectedRowModel().flatRows.map(r => r.original.id)
  const selectedRows = table.getSelectedRowModel().flatRows
  const selectedStatuses = selectedRows.map(r => r.original.status?.toLowerCase())

  const allSelectedAreOnWay = selectedCount > 0 && selectedStatuses.every(status => status === 'onway')

  const emptyFilters = {
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [],
    courierPlatforms: [],
    statusChipColorForBooking: [],
    paymentStatus: [],
    tags: [],
    pakistanCities: []
  }

  // if (error) {
  //   return (
  //     <Card>
  //       <CardContent className='flex items-center justify-between'>
  //         <Typography color='error'>Failed to fetch orders: {error?.message || String(error)}</Typography>
  //         <Button variant='contained'>Retry</Button>
  //       </CardContent>
  //     </Card>
  //   )
  // }
  return (
    <Card>
      <CardContent className='w-full flex items-start justify-between'>
        <div className='flex flex-wrap items-center gap-4 w-full'>
          {/* <Button variant='outlined' startIcon={<i className='bx-filter' />} onClick={() => setOpenFilter(true)}>
            Filter
          </Button> */}

          {/* <RangePicker
            status='success'
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            onChange={dates => {
              if (dates && dates.length === 2) {
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                }))
              } else {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }
            }}
          /> */}

          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={val => {
              setGlobalFilter(String(val))
              onSearchChange?.(val) // Add this line
            }}
            onEnter={val => {
              setGlobalFilter(val)
              onSearchChange?.(val)
            }}
            placeholder='Search in booking order'
            debounce={1000}
          />

          <RangePicker
            status='success'
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            onChange={dates => {
              if (dates && dates.length === 2) {
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                }))
              } else {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }
            }}
            className='flex py-2'
          />

          {/* <FilterModal
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            initialFilters={rawFilters}
            onApply={appliedFilters => {
              setRawFilters(appliedFilters)

              dispatch(fetchBookingOrder({ page: 1, limit: 25, filters: appliedFilters }))

              // setColumnFilters(newColumnFilters)

              // notify parent to fetch with new filters
              onFiltersChange?.(appliedFilters)
              onPageChange?.(1)
              setOpenFilter(false)
            }}
          /> */}
          {/* <DateRangePicker /> */}

          {/* Add the Change Status button - only shows when orders are selected */}
          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Change Courier', color: 'info', variant: 'tonal' }}
              dialog={EditCourierInfo}
              size='small'
              dialogProps={{
                data: (() => {
                  const firstSelected = table.getSelectedRowModel().flatRows[0]?.original

                  const inferCourierKey = name => {
                    if (!name) return 'none'
                    const n = String(name).toLowerCase()

                    if (n.includes('leopard')) return 'leopard'

                    // if (n.includes('daewoo')) return 'daewoo'
                    // if (n.includes('post')) return 'postEx'
                    // if (n.includes('m&p') || n.includes('mp')) return 'mp'
                    // if (n.includes('tcs')) return 'tcs'
                    return 'none'
                  }

                  const defaultCourier = inferCourierKey(firstSelected?.platform)

                  return {
                    orderIds: selectedIds,
                    courier: defaultCourier,
                    reason: ''
                  }
                })(),
                onSubmit: async (payload, controls) => {
                  try {
                    const courierApiMap = {
                      // none: 'None',
                      leopard: 'Leopard'

                      // daewoo: 'Daewoo',
                      // postEx: 'PostEx',
                      // mp: 'M&P',
                      // tcs: 'TCS'
                    }

                    const freshSelectedIds = table.getSelectedRowModel().flatRows.map(r => r.original.id)

                    const body = {
                      orderId: freshSelectedIds.map(id => String(id)),
                      courier: courierApiMap[payload.courier] || payload.courier,
                      reason: payload.reason
                    }

                    const res = await dispatch(courierAssignment(body)).unwrap()

                    setAlert({ open: true, message: res?.message || 'Courier updated', severity: 'success' })
                    controls?.close()
                    controls?.reset()
                    setRowSelection({})
                    await dispatch(
                      fetchBookingOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage, force: true })
                    )
                  } catch (err) {
                    setAlert({ open: true, message: err?.message || 'Failed to assign courier', severity: 'error' })
                  } finally {
                    controls?.done?.()
                  }
                }
              }}
            />
          )}

          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Download Load Sheet', color: 'primary', variant: 'tonal' }}
              dialog={ConfirmationDialog}
              size='small'
              dialogProps={{
                type: 'download-load-sheet',
                payload: { orderIds: selectedIds },
                onSuccess: async ({ orderIds }) => {
                  try {
                    const res = await dispatch(downloadLoadSheet({ orderIds })).unwrap()
                    const data = res?.data || res
                    const base64 = data?.base64
                    const filename = data?.filename || 'loadsheet.pdf'
                    const mimeType = data?.mimeType || 'application/pdf'

                    if (base64) {
                      const link = document.createElement('a')

                      link.href = `data:${mimeType};base64,${base64}`
                      link.download = filename
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                    }
                  } catch (e) {
                    console.error('Failed to download load sheet', e)
                  }
                }
              }}
            />
          )}
          {/* {selectedCount >= 2 ? (
          <OpenDialogOnElementClick
            element={Button}
            elementProps={{ children: 'Merge orders', color: 'secondary', variant: 'tonal' }}
            dialog={ConfirmationDialog}
            dialogProps={{
              type: 'merge-orders',
              payload: (() => {
                // console.log('Merge Payload:', { orderIds: selectedIds })

                return { orderIds: selectedIds }
              })(),
              onSuccess: async () => {
                const result = await dispatch(fetchBookingOrder({ page: 1, limit, force: true }))

                setRowSelection({})

                // console.log('Merge Orders Success', result)
              }
            }}
          />
        ) : (
          <Button color='secondary' variant='tonal' disabled size='small'>
            Merge orders
          </Button>
        )} */}

          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Generate Airway Bill', color: 'primary', variant: 'tonal' }}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'generate-airway-bill', payload: { orderIds: selectedIds } }}
              size='small'
            />
          )}

          {allSelectedAreOnWay && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{
                children: 'Mark as Dispatching',
                color: 'success',
                variant: 'contained',
                size: 'small'
              }}
              dialog={ConfirmationDialog}
              dialogProps={{
                type: 'update-status',
                payload: {
                  orderIds: selectedIds,
                  fromStatus: 'onWay',
                  toStatus: 'Dispatching',
                  toStatusKey: 'dispatching'
                },
                onSuccess: async () => {
                  await dispatch(
                    fetchBookingOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage, force: true })
                  )
                  setRowSelection({})
                }
              }}
            />
          )}
        </div>

        <div className='flex max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            select
            value={limit}
            onChange={async e => {
              const newLimit = Number(e.target.value)

              // console.log('newLimit', newLimit)
              onLimitChange?.(newLimit)
            }}
            className='max-sm:is-full sm:is-[80px]'
          >
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </CustomTextField>

          <Button variant='tonal' color='secondary' startIcon={<i className='bx-export' />}>
            Export
          </Button>
        </div>
      </CardContent>

      <CardContent className='grid grid-cols-4 gap-3 '>
        <Autocomplete
          multiple
          fullWidth
          options={paymentMethodsArray}
          getOptionLabel={option => option.label}
          value={filters.paymentMethods || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, paymentMethods: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Method' label='Payment Method' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={activeCouriers}
          getOptionLabel={option => option.label}
          value={filters.courierPlatforms || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, courierPlatforms: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return <Chip {...props} key={option.value || index} variant='outlined' label={option.label} />
            })
          }
          renderInput={params => <TextField {...params} placeholder='Courier' label='Courier' size='medium' />}
        />

        <Autocomplete
          multiple
          fullWidth
          options={orderStatusArray}
          getOptionLabel={option => option.label}
          value={filters.orderStatus || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, orderStatus: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Order Status' label='Order Status' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={paymentStatusArray}
          getOptionLabel={option => option.label}
          value={filters.paymentStatus || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, paymentStatus: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Status' label='Payment Status' size='medium' />
          )}
        />
      </CardContent>

      <CardContent className='grid grid-cols-4 gap-3'>
        <AmountRangePicker
          style={{ border: '1px solid #00000' }}
          min={filters.minAmount}
          max={filters.maxAmount}
          onChange={([min, max]) =>
            setFilters(prev => ({
              ...prev,
              minAmount: min || '',
              maxAmount: max || ''
            }))
          }
        />
        <Autocomplete
          multiple
          fullWidth
          options={tagsArray}
          getOptionLabel={option => option.label}
          value={filters.tags || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, tags: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => <TextField {...params} fullWidth placeholder='Tags' label='Tags' size='medium' />}
        />
        <Autocomplete
          multiple
          fullWidth
          options={citiesArray}
          getOptionLabel={option => option.label}
          value={filters.pakistanCities || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, pakistanCities: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => <TextField {...params} fullWidth placeholder='City' label='City' size='medium' />}
        />
        <DialogActions className='justify-between px-1 py-0'>
          <div className='flex'>
            <Button
              onClick={() => {
                setFilters(emptyFilters)
                dispatch(fetchBookingOrder({ page: 1, limit, filters: emptyFilters }))
                onFiltersChange?.(emptyFilters)

                // onPageChange?.(1)
              }}
              color='error'
              variant='tonal'
            >
              Reset Filters
            </Button>
            <Button
              onClick={() => {
                const apiFilters = mapFiltersToApiFormat(filters)

                dispatch(fetchBookingOrder({ page: 1, limit, filters: apiFilters, force: true }))
                onFiltersChange?.(apiFilters)

                onPageChange?.(1)
              }}
              variant='contained'
            >
              Apply Filters
            </Button>
          </div>
        </DialogActions>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={classnames({ 'cursor-pointer select-none': h.column.getCanSort() })}
                    style={{
                      width: h.column.columnDef.meta?.width || 'auto',
                      maxWidth: h.column.columnDef.meta?.width || 'none'
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: <i className='bx-chevron-up text-xl' />,
                      desc: <i className='bx-chevron-down text-xl' />
                    }[h.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <CircularProgress color='primary' />
                </td>
              </tr>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className='no-scrollbar'
                      style={{
                        width: cell.column.columnDef.meta?.width || 'auto',
                        maxWidth: cell.column.columnDef.meta?.width || 'none',
                        overflow: 'scroll',
                        textOverflow: 'text-wrap',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePaginationComponent
        table={table}
        count={pagination.total || 0} // Use the total prop from parent, not pagination.total
        page={pagination?.currentPage - 1 || 0} // Use the page prop directly, not activePage
        onPageChange={(_e, newPage) => {
          onPageChange?.(newPage + 1) // This will call parent's setPage
        }}
        rowsPerPage={pagination.itemsPerPage || limit} // Use the limit prop directly, not pagination.itemsPerPage
        onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
        rowsPerPageOptions={[25, 50, 100]}
      />

      <TagEditDialog
        open={tagModal.open}
        initialTags={tagModal.tags}
        onClose={closeTagEditor}
        onSave={handleSaveTags}
        loading={loadings}
      />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} variant='filled'>
          {alert.message}
        </Alert>
      </Snackbar>
      {/* Right-side Drawer for order details */}
      <Drawer
        anchor='right'
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '80vw' } } }}
      >
        <Box className='p-4 overflow-auto' sx={{ height: '100%' }}>
          <div className='flex justify-end'>
            <IconButton onClick={() => setDetailsOpen(false)} aria-label='Close'>
              <i className='bx-x text-2xl' />
            </IconButton>
          </div>
          {detailsOrderId ? <OrderDetails id={detailsOrderId} /> : null}
        </Box>
      </Drawer>
    </Card>
  )
}

export default BookingListTable
