import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa'

const EditOrderModal = ({ open, onClose, order, onUpsell }) => {
  const [products, setProducts] = useState(order.line_items || [])
  const [initialProducts, setInitialProducts] = useState(order.line_items || [])
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    setProducts(order.line_items || [])
    setInitialProducts(order.line_items || [])
    setIsChanged(false)
  }, [order])

  // Handle quantity change
  const updateQuantity = (index, delta) => {
    setProducts(prev => prev.map((p, i) => (i === index ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)))
  }

  // Add new empty product row
  const addNewProduct = () => {
    setProducts(prev => [...prev, { id: `temp-${Date.now()}`, title: '', quantity: 1, price: 0, isNew: true }])
  }

  // Delete only newly added products
  const deleteProduct = index => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  // Detect if there’s any change
  useEffect(() => {
    const hasQuantityChanged = products.some((p, i) => {
      const initial = initialProducts.find(ip => ip.id === p.id)

      return initial ? initial.quantity !== p.quantity : false
    })

    const hasNewProduct = products.some(p => p.isNew)

    setIsChanged(hasQuantityChanged || hasNewProduct)
  }, [products, initialProducts])

  const handleUpsell = () => {
    onUpsell(products)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Edit Order</DialogTitle>
      <DialogContent>
        {products.map((product, index) => {
          const isExisting = initialProducts.some(ip => ip.id === product.id)

          return (
            <div key={product.id} className='flex items-center gap-3 my-3'>
              <Typography className='flex-1'>{product.title || 'New Product'}</Typography>

              <IconButton onClick={() => updateQuantity(index, -1)}>
                <FaMinus />
              </IconButton>

              <TextField
                type='number'
                size='small'
                value={product.quantity}
                onChange={e => updateQuantity(index, Number(e.target.value) - product.quantity)}
                className='w-20'
              />

              <IconButton onClick={() => updateQuantity(index, +1)}>
                <FaPlus />
              </IconButton>

              {/* Allow delete only for new products */}
              {!isExisting && (
                <IconButton color='error' onClick={() => deleteProduct(index)}>
                  <FaTrash />
                </IconButton>
              )}
            </div>
          )
        })}
        <Button variant='outlined' onClick={addNewProduct} sx={{ mt: 2 }}>
          + Add Product
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {isChanged && (
          <Button variant='contained' onClick={handleUpsell}>
            Upsell Order
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default EditOrderModal
