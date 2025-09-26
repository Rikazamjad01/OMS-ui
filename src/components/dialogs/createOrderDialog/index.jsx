'use client'
import { useState, useEffect } from 'react'

import Image from 'next/image'

import {
  Snackbar,
  Alert,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Autocomplete
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Add, Remove } from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'

import CitiesData from '@/data/cities/cities'

// Redux imports
import { fetchProducts, selectProducts, selectProductsLoading } from '@/redux-store/slices/products'
import { createOrder, fetchOrders } from '@/redux-store/slices/order'

import DialogCloseButton from '../DialogCloseButton'

export const paymentMethods = {
  cod: { text: 'COD' },
  wallet: { text: 'Wallet' }
}

const ProvincesData = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu and Kashmir'
]

const CreateOrderDialog = ({ open, setOpen, onSuccess }) => {
  const dispatch = useDispatch()
  const allProducts = useSelector(selectProducts)
  const loading = useSelector(selectProductsLoading)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchQuery, setSearchQuery] = useState('')

  // Customer/order details
  const [orderData, setOrderData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    platform: '',
    payment_gateway_names: ['Cash on Delivery']
  })

  const [products, setProducts] = useState([])
  const [showProductSelector, setShowProductSelector] = useState(false)

  const filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const shipping_lines_data = [
    {
      id: 1,
      title: 'Standard Shipping',
      code: 'Standard Shipping',
      price: 180,
      source: 'shopify'
    },
    {
      id: 2,
      title: 'Express Shipping',
      code: 'Express Shipping',
      price: 300,
      source: 'shopify'
    },
    {
      id: 3,
      title: 'Deluxe Shipping',
      code: 'Deluxe Shipping',
      price: 0,
      source: 'shopify'
    }
  ]

  const platforms_data = ['shopify', 'whatsapp', 'socialMedia', 'other']

  useEffect(() => {
    if (open) {
      dispatch(fetchProducts({ page: 1, limit: 100 }))
      setProducts([])
    }
  }, [open, dispatch])

  const handleClose = () => setOpen(false)

  const updateQuantity = (index, delta) => {
    setProducts(prev =>
      prev.map((p, i) => (i === index ? { ...p, quantity: Math.max(1, (p.quantity || 1) + delta) } : p))
    )
  }

  const updateField = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }))
  }

  const addNewProduct = product => {
    if (products.find(p => p.id === product.id)) return
    setProducts(prev => [...prev, { ...product, quantity: 1 }])
  }

  const deleteProduct = index => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateOrder = () => {
    if (products.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one product',
        severity: 'error'
      })

      return
    }

    const payload = {
      ...orderData,
      shippingId: orderData.shipping_line?.id,
      line_items: products.map(p => ({
        id: p.id,
        quantity: p.quantity,
        variant_id: p.variant?.id || p.variants?.[0]?.id
      })),
      country_code: 'PK',
      country: 'Pakistan',
      currency: 'PKR'
    }

    dispatch(createOrder(payload))
      .unwrap()
      .then(() => {
        setSnackbar({ open: true, message: 'Order created successfully!', severity: 'success' })
        setOpen(false)
        onSuccess?.()
        dispatch(fetchOrders({ page: 1, limit: 25, force: true }))
      })
      .catch(err => setSnackbar({ open: true, message: 'Failed: ' + err, severity: 'error' }))
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>

      <DialogTitle>Create Manual Order</DialogTitle>

      <form
        onSubmit={e => {
          e.preventDefault()
          handleCreateOrder()
        }}
      >
        <DialogContent>
          {/* Customer details */}
          <div className='flex flex-wrap mb-4'>
            <div className='flex flex-wrap items-center gap-4 py-2'>
              <div className='w-full xl:w-1/3'>
                <TextField
                  label='First Name'
                  fullWidth
                  value={orderData.first_name}
                  onChange={e => updateField('first_name', e.target.value)}
                  required
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <TextField
                  label='Last Name'
                  fullWidth
                  value={orderData.last_name}
                  onChange={e => updateField('last_name', e.target.value)}
                  required
                />
              </div>
              <div className='w-full xl:w-1/4'>
                <TextField
                  label='Email'
                  fullWidth
                  value={orderData.email}
                  onChange={e => updateField('email', e.target.value)}
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <TextField
                  label='Phone'
                  fullWidth
                  value={orderData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  required
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <TextField
                  label='Address 1'
                  fullWidth
                  value={orderData.address1}
                  onChange={e => updateField('address1', e.target.value)}
                  required
                />
              </div>
              <div className='w-full xl:w-1/4'>
                <TextField
                  label='Address 2 (Optional)'
                  fullWidth
                  value={orderData.address2}
                  onChange={e => updateField('address2', e.target.value)}
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <Autocomplete
                  options={CitiesData}
                  value={orderData.city || null}
                  onChange={(event, newValue) => updateField('city', newValue)}
                  filterSelectedOptions
                  renderInput={params => <TextField {...params} label='City' fullWidth required />}
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <Autocomplete
                  options={ProvincesData}
                  value={orderData.province || null}
                  onChange={(event, newValue) => updateField('province', newValue)}
                  filterSelectedOptions
                  renderInput={params => <TextField {...params} label='Province' fullWidth required />}
                />
              </div>
              <div className='w-full xl:w-1/4'>
                <TextField
                  label='Zip Code'
                  fullWidth
                  value={orderData.zip}
                  onChange={e => updateField('zip', e.target.value)}
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <Autocomplete
                  options={platforms_data}
                  value={orderData.platform || null}
                  onChange={(event, newValue) => updateField('platform', newValue)}
                  filterSelectedOptions
                  renderInput={params => <TextField {...params} label='Platform' fullWidth required />}
                />
              </div>
              <div className='w-full xl:w-1/3'>
                <TextField
                  label='Payment Method'
                  fullWidth
                  value={orderData.payment_gateway_names}
                  onChange={e => updateField('payment_gateway_names', e.target.value)}
                  required
                />
              </div>
              <div className='w-full xl:w-1/4'>
                <Autocomplete
                  options={shipping_lines_data}
                  getOptionLabel={option => option.title}
                  value={orderData.shipping_line || null}
                  onChange={(event, newValue) => updateField('shipping_line', newValue)}
                  renderInput={params => <TextField {...params} label='Shipping Method' fullWidth required />}
                />
              </div>
            </div>
          </div>

          {/* Products */}
          {products.map((product, index) => (
            <div key={product.id} className='flex items-center gap-4 border p-4 rounded-md w-full my-2'>
              <TextField label='Product' fullWidth value={product.title || ''} InputProps={{ readOnly: true }} />
              <div className='flex items-center gap-1'>
                <IconButton onClick={() => updateQuantity(index, -1)} disabled={product.quantity <= 1}>
                  <Remove />
                </IconButton>
                <TextField
                  type='number'
                  size='small'
                  value={product.quantity}
                  onChange={e => {
                    const val = Math.max(1, Number(e.target.value))

                    setProducts(prev => prev.map((p, i) => (i === index ? { ...p, quantity: val } : p)))
                  }}
                  className='w-16'
                />
                <IconButton onClick={() => updateQuantity(index, 1)}>
                  <Add />
                </IconButton>
                <Button variant='outlined' color='error' size='small' onClick={() => deleteProduct(index)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}

          <Grid item xs={12} my={5} className='flex gap-4 justify-between'>
            <Button variant='outlined' onClick={() => setShowProductSelector(!showProductSelector)}>
              + Add Product
            </Button>
            {showProductSelector && (
              <div className='flex gap-2'>
                <Button variant='outlined' onClick={() => setShowProductSelector(!showProductSelector)}>
                  Hide Products
                </Button>
                <Grid item xs={12} >
                  <TextField
                    fullWidth
                    placeholder='Search products...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}

                  />
                </Grid>
              </div>
            )}
          </Grid>

          {showProductSelector && (
            <Grid item xs={12} className='mt-2 h-60 overflow-y-scroll'>
              {loading ? (
                <Typography>Loading products...</Typography>
              ) : filteredProducts.length === 0 ? (
                <Typography>No products found</Typography>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className='border p-2 flex justify-between items-center mb-2'>
                    <div className='flex gap-2'>
                      <Image
                        src={product.image?.src || '/productPlaceholder.png'}
                        alt='Product'
                        width={40}
                        height={40}
                      />
                      <Typography>{product.title}</Typography>
                    </div>
                    {products.find(p => p.id === product.id) ? (
                      <Button variant='outlined' size='small' disabled className='flex items-center gap-1'>
                        <i className='fa fa-check' />
                        selected
                      </Button>
                    ) : (
                      <Button variant='contained' size='small' onClick={() => addNewProduct(product)}>
                        Select
                      </Button>
                    )}
                  </div>
                ))
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant='contained' onClick={handleCreateOrder}>
            Create Order
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  )
}

export default CreateOrderDialog
