'use client'
import { useState, useEffect } from 'react'

import Image from 'next/image'

import { Snackbar, Alert } from '@mui/material'

import { useSelector, useDispatch } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { Add, Remove } from '@mui/icons-material'

// Redux
import { fetchProducts, selectProducts, selectProductsLoading } from '@/redux-store/slices/products'
import { updateOrderProducts } from '@/redux-store/slices/order'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'

const EditOrderDialog = ({ open, setOpen, order, onSuccess }) => {
  const dispatch = useDispatch()
  const allProducts = useSelector(selectProducts)
  const loading = useSelector(selectProductsLoading)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [products, setProducts] = useState([]) // products in this order
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showProducts, setShowProducts] = useState(true)

  // Merge order products + line_items when modal opens
  useEffect(() => {
    if (open) {
      const mergedProducts = (order?.products || []).map(prod => {
        const lineItem = (order?.line_items || []).find(li => li.id === prod.id)
        const defaultVariant = prod.variants?.[0]

        return {
          ...prod,
          quantity: lineItem?.quantity || 1,
          variant: lineItem?.variant_id
            ? { id: lineItem.variant_id } // use existing line_item variant
            : defaultVariant || null
        }
      })

      setProducts(mergedProducts)
      dispatch(fetchProducts({ page: 1, limit: 100 })) // fetch all products for selection
    }
  }, [open, order, dispatch])

  const handleClose = () => {
    setOpen(false)
  }

  const updateQuantity = (index, delta) => {
    setProducts(prev =>
      prev.map((p, i) => (i === index ? { ...p, quantity: Math.max(1, (p.quantity || 1) + delta) } : p))
    )
  }

  const updateProductField = (index, field, value) => {
    setProducts(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const addNewProduct = product => {
    setProducts(prev => {
      // Avoid duplicates
      if (prev.find(p => p.id === product.id)) return prev

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const deleteProduct = index => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpsell = () => {
    dispatch(updateOrderProducts({ orderId: order.id, products }))
      .unwrap()
      .then(() => {
        setSnackbar({ open: true, message: 'Order updated successfully!', severity: 'success' })
        setOpen(false)
      })
      .catch(err => setSnackbar({ open: true, message: 'Failed to update order: ' + err, severity: 'error' }))
    handleClose()
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Edit & Upsell Order
        <Typography component='span' className='flex flex-col text-center'>
          Modify product quantities or add new items to upsell this order.
        </Typography>
      </DialogTitle>

      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={4}>
            {products.map((product, index) => (
              <Grid key={product.id} size={{ xs: 12 }} className='flex items-center gap-4 border-b pb-2'>
                <TextField label='Product' fullWidth value={product.title || ''} readOnly />
                <TextField
                  type='number'
                  label='Price (PKR)'
                  value={product.price || 0}
                  className='w-40'
                  InputProps={{ readOnly: true }}
                />
                <div className='flex items-center gap-1'>
                  <IconButton onClick={() => updateQuantity(index, -1)} disabled={product.quantity <= 1}>
                    <Remove />
                  </IconButton>
                  <TextField
                    type='number'
                    size='small'
                    value={product.quantity || 1}
                    onChange={e => updateProductField(index, 'quantity', Math.max(1, Number(e.target.value)))}
                    className='w-16'
                  />
                  <IconButton onClick={() => updateQuantity(index, +1)}>
                    <Add />
                  </IconButton>
                  <Button variant='outlined' color='error' size='small' onClick={() => deleteProduct(index)}>
                    Delete
                  </Button>
                </div>
              </Grid>
            ))}

            <div className='flex w-full justify-between'>
              <Grid size={{ xs: 12 }}>
                <Button variant='outlined' onClick={() => setShowProductSelector(!showProductSelector)}>
                  + Add Product
                </Button>
              </Grid>
              {showProductSelector && (
                <Grid size={{ xs: 12 }} className='mb-4 flex justify-end'>
                  <Button variant='outlined' onClick={() => setShowProductSelector(!showProductSelector)}>
                    Hide Products
                  </Button>
                </Grid>
              )}
            </div>

            {/* Product Selector List */}
            {showProductSelector && (
              <Grid size={{ xs: 12 }} className='mt-4'>
                {loading ? (
                  <Typography>Loading products...</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {allProducts.map(product => (
                      <Grid
                        key={product.id}
                        size={{ xs: 12, sm: 6 }}
                        className='border p-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 gap-2'
                      >
                        <div className='flex gap-2'>
                          <div className='w-10 h-10'>
                            <Image
                              src={product.image?.src || null}
                              alt={product.title || 'Product'}
                              width={50}
                              height={50}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <div className='flex flex-col gap-y-4'>
                            <Typography fontWeight={500}>{product.title}</Typography>
                            <Typography>Price: {product.price}</Typography>
                          </div>
                        </div>
                        <Button variant='contained' size='small' onClick={() => addNewProduct(product)}>
                          Select
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={handleUpsell} type='submit'>
            Upsell Order
          </Button>
          <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default EditOrderDialog
