// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const productStockObj = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({ setData, productData }) => {
  // Modal open/close state
  const [open, setOpen] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    productID: '',
    productName: '',
    category: '',
    stock: '',
    sku: '',
    price: '',
    qty: '',
    status: ''
  })

  // Apply filter logic
  useEffect(() => {
    const filteredData = productData?.filter(product => {
      if (filters.productID && product.productID !== filters.productID) return false
      if (filters.productName && !product.productName.toLowerCase().includes(filters.productName.toLowerCase())) return false
      if (filters.category && product.category !== filters.category) return false
      if (filters.stock && product.stock !== productStockObj[filters.stock]) return false
      if (filters.sku && !product.sku.toLowerCase().includes(filters.sku.toLowerCase())) return false
      if (filters.price && product.price !== Number(filters.price)) return false
      if (filters.qty && product.qty !== Number(filters.qty)) return false
      if (filters.status && product.status !== filters.status) return false

      return true
    })

    setData(filteredData ?? [])
  }, [filters, productData, setData])

  // Handlers
  const handleChange = field => e => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleReset = () => {
    setFilters({
      productID: '',
      productName: '',
      category: '',
      stock: '',
      sku: '',
      price: '',
      qty: '',
      status: ''
    })
    setOpen(false)
  }

  return (
    <div>
      {/* Filter Button */}
      <Button
        variant="outlined"
        startIcon={<i className="bx-filter" />}
        onClick={() => setOpen(true)}
      >
        Filter
      </Button>

      {/* Filter Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Products</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="Product ID"
                value={filters.productID}
                onChange={handleChange('productID')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="Product Name"
                value={filters.productName}
                onChange={handleChange('productName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={handleChange('category')}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Accessories">Accessories</MenuItem>
                <MenuItem value="Home Decor">Home Decor</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Shoes">Shoes</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Games">Games</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label="Stock"
                value={filters.stock}
                onChange={handleChange('stock')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="SKU"
                value={filters.sku}
                onChange={handleChange('sku')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="Price"
                type="number"
                value={filters.price}
                onChange={handleChange('price')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="QTY"
                type="number"
                value={filters.qty}
                onChange={handleChange('qty')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={handleChange('status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </CustomTextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset} color="secondary">Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TableFilters
