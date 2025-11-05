'use client'

import { useState } from 'react'
import { Box, TextField, Typography, Button, Paper } from '@mui/material'
import Grid from '@mui/material/Grid2'

const SetupUpsellCommission = () => {
  const [formData, setFormData] = useState({
    sameProductSameVariant: '',
    sameProductDifferentVariant: '',
    differentProduct: '',
    differentBrand: ''
  })

  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Upsell Commission Configured:', formData)

    // later: send to API
  }

  return (
    <Paper elevation={0} sx={{ p: 6, border: '1px solid #ddd' }}>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Setup Upsell Commission
      </Typography>

      <Typography variant='body1' color='text.secondary' mb={4}>
        Configure the commission rates for upselling based on different product and variant scenarios. These settings
        help define how sales incentives are calculated when an agent sells additional or upgraded items.
      </Typography>

      <Box component='form' onSubmit={handleSubmit}>
        <Grid container columnSpacing={10} rowSpacing={4}>
          <Grid item size={5} xs={12} md={4}>
            <TextField
              fullWidth
              label='Same Product – Same Variant Commission (%)'
              name='sameProductSameVariant'
              type='number'
              value={formData.sameProductSameVariant}
              onChange={handleChange}
            />
          </Grid>

          <Grid item size={5} xs={12} md={4}>
            <TextField
              fullWidth
              label='Same Product – Different Variant Commission (%)'
              name='sameProductDifferentVariant'
              type='number'
              value={formData.sameProductDifferentVariant}
              onChange={handleChange}
            />
          </Grid>

          <Grid item size={5} xs={12} md={4}>
            <TextField
              fullWidth
              label='Different Product Commission (%)'
              name='differentProduct'
              type='number'
              value={formData.differentProduct}
              onChange={handleChange}
            />
          </Grid>

          <Grid item size={5} xs={12} md={4}>
            <TextField
              fullWidth
              label='Different Brand Commission (%)'
              name='differentBrand'
              type='number'
              value={formData.differentBrand}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box mt={4} display='flex' justifyContent='flex-end'>
          <Button type='submit' variant='contained' sx={{ px: 4 }}>
            Save Configuration
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default SetupUpsellCommission
