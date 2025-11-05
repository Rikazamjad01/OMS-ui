'use client'

import { useState } from 'react'
import { Box, TextField, Typography, Button, Divider } from '@mui/material'
import SlabRow from './SlabRow'

const ChannelForm = ({ channel }) => {
  const [incentiveAmount, setIncentiveAmount] = useState('')

  const [slabs, setSlabs] = useState([{ min: '', max: '', type: 'base', value: '' }])

  const [submitted, setSubmitted] = useState(false)
  const [responseData, setResponseData] = useState(null)

  const handleAddSlab = () => {
    setSlabs([...slabs, { min: '', max: '', type: 'base', value: '' }])
  }

  const handleRemoveSlab = index => {
    const newSlabs = slabs.filter((_, i) => i !== index)

    setSlabs(newSlabs)
  }

  const handleSlabChange = (index, updatedData) => {
    const newSlabs = slabs.map((s, i) => (i === index ? updatedData : s))

    setSlabs(newSlabs)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // simulate API payload + response
    const payload = { channel, incentiveAmount, slabs }

    // simulate API response
    const response = slabs.map(
      s =>
        `${s.min}-${s.max}% → ${
          s.type === 'bonus'
            ? `${Number(incentiveAmount) + Number(s.value / 100 * incentiveAmount)} with bonus`
            : s.type === 'deduct'
              ? `${incentiveAmount - Number(s.value / 100 * incentiveAmount)} with deduction`
              : `${Number(incentiveAmount)} (base)`
        }`
    )

    setResponseData(response)
    setSubmitted(true)
  }

  if (submitted && responseData) {
    return (
      <Box>
        <Typography variant='h6' mb={2}>
          Configured Slabs for {channel}
        </Typography>
        {responseData.map((line, i) => (
          <Typography key={i}>{line}</Typography>
        ))}

        <Button variant='outlined' sx={{ mt: 3 }} onClick={() => setSubmitted(false)}>
          Edit Configuration
        </Button>
      </Box>
    )
  }

  return (
    <Box component='form' onSubmit={handleSubmit}>
      <Typography variant='h6' className='my-5' gutterBottom>
        Setup Incentive for {channel}
      </Typography>

      <TextField
        label='Incentive Amount'
        type='number'
        fullWidth
        sx={{ mb: 3 }}
        value={incentiveAmount}
        onChange={e => setIncentiveAmount(e.target.value)}
      />

      {/* <Divider sx={{ mb: 2 }} /> */}

      {slabs.map((slab, index) => (
        <SlabRow key={index} index={index} slab={slab} onChange={handleSlabChange} onRemove={handleRemoveSlab} incentiveAmount={incentiveAmount}/>
      ))}

      <div className='w-full flex mt-4 justify-between'>
        <Button onClick={handleAddSlab} variant='outlined' className='p-2' size='small' sx={{ mb: 2 }}>
          + Add New Slab
        </Button>

        <Box>
          <Button type='submit' variant='contained'>
            Submit
          </Button>
        </Box>
      </div>

    </Box>
  )
}

export default ChannelForm
