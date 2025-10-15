import { useEffect, useState } from 'react'
import { TextField } from '@mui/material'
import { Typography } from 'antd'
import { updateCourier } from '@/redux-store/slices/couriers'

export const CourierRow = ({ courier, onUpdate }) => {
  const [minOrder, setMinOrder] = useState(courier.minimumOrderAmount || 0)
  const [maxOrder, setMaxOrder] = useState(courier.maximumOrderAmount || 0)

  const handleBlur = (field, value) => {
    if (value !== courier[field]) {
      onUpdate(courier._id || courier.id, field, Number(value))
    }
  }

  useEffect(() => {
    if (Number(maxOrder) < Number(minOrder)) {
      setMaxOrder(minOrder)
    }
  }, [minOrder])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (minOrder !== courier.minimumOrderAmount) {
        updateCourier(courier._id || courier.id, 'minimumOrderAmount', Number(minOrder))
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [minOrder])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (maxOrder !== courier.maximumOrderAmount) {
        updateCourier(courier._id || courier.id, 'maximumOrderAmount', Number(maxOrder))
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [maxOrder])

  return (
    <div
      key={courier.id}
      className='grid grid-cols-[2fr_1fr_1fr] items-center gap-4 py-2 px-2 hover:bg-gray-50 rounded-md transition'
    >
      <div>
        <Typography variant='h6'>{courier.name}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {courier.subtitle}
        </Typography>
      </div>

      <TextField
        type='number'
        size='small'
        className='w-24'
        value={minOrder}
        onChange={e => setMinOrder(e.target.value)}
        onBlur={() => handleBlur('minimumOrderAmount', minOrder)}
        inputProps={{ min: 0 }}
      />

      <TextField
        type='number'
        size='small'
        className='w-24'
        value={maxOrder}
        onChange={e => setMaxOrder(e.target.value)}
        onBlur={() => handleBlur('maximumOrderAmount', maxOrder)}
        inputProps={{ min: 0 }}
      />
    </div>
  )
}
