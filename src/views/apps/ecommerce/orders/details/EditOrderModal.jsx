import { useState } from 'react'

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
import { FaMinus, FaPlus } from "react-icons/fa";

const EditOrderModal = ({ open, onClose, order, onUpsell }) => {
  const [products, setProducts] = useState(order.line_items || [])

  // Handle quantity change
  const updateQuantity = (index, delta) => {
    setProducts(prev => prev.map((p, i) => (i === index ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)))
  }

  // Add new empty product row
  const addNewProduct = () => {
    setProducts(prev => [...prev, { id: `temp-${Date.now()}`, title: '', quantity: 1, price: 0 }])
  }

  const handleUpsell = () => {
    onUpsell(products)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Edit Order</DialogTitle>
      <DialogContent>
        {products.map((product, index) => (
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
          </div>
        ))}
        <Button variant='outlined' onClick={addNewProduct} sx={{ mt: 2 }}>
          + Add Product
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleUpsell}>
          Upsell Order
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditOrderModal
