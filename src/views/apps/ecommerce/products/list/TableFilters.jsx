// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
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

const mapFiltersToApi = uiFilters => {
  const apiFilters = {}

  if (uiFilters.id) apiFilters.id = uiFilters.id
  if (uiFilters.productName) apiFilters.title = uiFilters.productName
  if (uiFilters.category) apiFilters.vendor = uiFilters.category

  if (uiFilters.stock) apiFilters.stock = productStockObj[uiFilters.stock]

  if (uiFilters.sku) apiFilters.sku = uiFilters.sku
  if (uiFilters.price) apiFilters.price = uiFilters.price
  if (uiFilters.qty) apiFilters.inventory_quantity = uiFilters.qty

  if (uiFilters.status) {
    const statusMap = {
      active: 'active',
      Inactive: 'inactive',
      draft: 'draft'
    }

    apiFilters.status = statusMap[uiFilters.status] || uiFilters.status
  }

  return apiFilters
}

const TableFilters = ({ onApplyFilters, onResetFilters }) => {
  const [open, setOpen] = useState(false)

  const [filters, setFilters] = useState({
    id: '',
    productName: '',
    category: '',
    stock: '',
    sku: '',
    price: '',
    qty: '',
    status: ''
  })

  const handleChange = field => e => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleReset = () => {
    setFilters({
      id: '',
      productName: '',
      category: '',
      stock: '',
      sku: '',
      price: '',
      qty: '',
      status: ''
    })

    if (onResetFilters) {
      onResetFilters()
    }

    // Close modal
    setOpen(false)
  }

  return (
    <div>
      <Button variant='outlined' startIcon={<i className='bx-filter' />} onClick={() => setOpen(true)}>
        Filter
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Filter Products</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Product ID' value={filters.id} onChange={handleChange('id')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Product Name'
                value={filters.productName}
                onChange={handleChange('productName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Category'
                value={filters.category}
                onChange={handleChange('category')}
              >
                <MenuItem value=''>All Categories</MenuItem>
                <MenuItem value='Accessories'>General Oils</MenuItem>
                <MenuItem value='Home Decor'>Meditation Oils</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField select fullWidth label='Stock' value={filters.stock} onChange={handleChange('stock')}>
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='True'>In Stock</MenuItem>
                <MenuItem value='False'>Out of Stock</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='SKU' value={filters.sku} onChange={handleChange('sku')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Price'
                type='number'
                value={filters.price}
                onChange={handleChange('price')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='QTY' type='number' value={filters.qty} onChange={handleChange('qty')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField select fullWidth label='Status' value={filters.status} onChange={handleChange('status')}>
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
                <MenuItem value='Draft'>Draft</MenuItem>
              </CustomTextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='flex items-center justify-between'>
          <Button onClick={handleReset} color='error' variant='tonal'>
            Reset
          </Button>
          <div>
            <Button onClick={handleReset} color='secondary' variant='tonal'>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const apiFilters = mapFiltersToApi(filters)

                onApplyFilters(apiFilters)
                setOpen(false)
              }}
              variant='contained'
            >
              Apply
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TableFilters
