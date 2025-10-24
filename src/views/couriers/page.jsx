'use client'

// Next Imports
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import { Box, Chip, CircularProgress, TextField } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomIconButton from '@core/components/mui/IconButton'

import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import {
  updateCourier,
  deleteCourier,
  fetchCouriers,
  selectCouriers,
  selectCouriersLoading
} from '@/redux-store/slices/couriers'

// Vars
// const connectedAccountsArr = [
//   {
//     checked: true,
//     title: 'Google',
//     logo: '/images/logos/google.png',
//     subtitle: 'Calendar and Contacts'
//   },
//   {
//     checked: false,
//     title: 'Slack',
//     logo: '/images/logos/slack.png',
//     subtitle: 'Communications'
//   },
//   {
//     checked: true,
//     title: 'Github',
//     logo: '/images/logos/github.png',
//     subtitle: 'Manage your Git repositories'
//   },
//   {
//     checked: true,
//     title: 'Mailchimp',
//     subtitle: 'Email marketing service',
//     logo: '/images/logos/mailchimp.png'
//   },
//   {
//     title: 'Asana',
//     checked: false,
//     subtitle: 'Task Communication',
//     logo: '/images/logos/asana.png'
//   }
// ]

import CourierFormDialog from '@/components/dialogs/CourierFormDialog'
import { CourierRow } from './CourierRow'

const courierPlatforms = [
  { title: 'Leopard', code: 'leopard', img: '/images/couriers/leopards.png' },
  { title: 'Daewoo', code: 'daewoo', img: '/images/couriers/daewoo.png' },
  { title: 'Post Ex', code: 'postEx', img: '/images/couriers/postEx.jpg' }

  // { title: 'M&P', code: 'mp', img: '/images/couriers/m&p.jpg' },
  // { title: 'TCS', code: 'tcs', img: '/images/couriers/tcs.jpg' }
]

const CouriersPage = () => {
  const dispatch = useDispatch()

  const allCouriers = useSelector(selectCouriers)
  const activatedCouriers = useSelector(state => state.couriers.couriers?.filter(c => c.active))

  // const courierLoading = useSelector(selectCouriersLoading)

  const [openForm, setOpenForm] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    dispatch(fetchCouriers())
  }, [dispatch])

  const handleEdit = courier => {
    setEditData(courier)
    setOpenForm(true)
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <Grid size={{ md: 6 }}>
          <div className='flex w-full justify-between items-center pe-5'>
            <CardHeader title='Courier Platforms' subheader='Manage your couriers' />
            <Chip
              label='+ Add'
              variant='outlined'
              className='cursor-pointer hover:bg-primary hover:text-white text-primary border-primary'
              onClick={() => {
                setEditData(null)
                setOpenForm(true)
              }}
            />
          </div>
          {/* show loading */}
          <CardContent>
            <div className='flex flex-col gap-4 w-full'>
              {allCouriers.map((courier, index) => (
                <div key={index} className='flex justify-between items-center w-full'>
                  <Typography variant='h6'>{courier.name}</Typography>
                  <div className='flex items-center gap-4'>
                    <OpenDialogOnElementClick
                      element={Switch}
                      elementProps={{
                        checked: !!courier.active,
                        color: 'primary',
                        inputProps: { 'aria-label': 'Activate courier' }
                      }}
                      dialog={ConfirmationDialog}
                      dialogProps={{
                        type: courier.active ? 'deactivate-courier' : 'activate-courier',
                        payload: {
                          id: courier.id
                        },
                        onSuccess: async () => {
                          await dispatch(
                            updateCourier({
                              id: courier._id,
                              active: !courier.active,
                              name: courier.name
                            })
                          ).unwrap()
                          await dispatch(fetchCouriers())
                        }
                      }}
                    />
                    <i className='bx bx-edit cursor-pointer hover:text-primary' onClick={() => handleEdit(courier)} />
                    <OpenDialogOnElementClick
                      element='i'
                      elementProps={{
                        className: 'bx bx-trash cursor-pointer hover:text-red-600'
                      }}
                      dialog={ConfirmationDialog}
                      dialogProps={{
                        type: 'delete-courier',
                        payload: { id: courier.id },
                        onSuccess: async () => {
                          await dispatch(deleteCourier(courier.id))
                          await dispatch(fetchCouriers())
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Grid>
      </Card>
      <Card>
        <Grid size={{ md: 6 }}>
          <CardHeader title='Courier Platforms' subheader='Courier platforms you want to use for your orders' />

          <CardContent>
            {/* Column headers */}
            <div className='grid grid-cols-[2fr_1fr_1fr] gap-4 mb-4 px-2'>
              <Typography variant='body2' className='font-semibold text-gray-600 text-start'>
                Courier Name
              </Typography>
              <Typography variant='body2' className='font-semibold text-gray-600 text-start'>
                Min Order Amount
              </Typography>
              <Typography variant='body2' className='font-semibold text-gray-600 text-start'>
                Max Order Amount
              </Typography>
            </div>

            {/* Courier rows */}
            <div className='flex flex-col divide-y divide-gray-200'>
              {activatedCouriers.map(courier => (
                <CourierRow
                  key={courier.id}
                  courier={courier}
                  onUpdate={async (id, field, value) => {
                    try {
                      await dispatch(updateCourier({ id, [field]: value })).unwrap()
                      dispatch(fetchCouriers())
                    } catch (err) {
                      console.error('Failed to update courier:', err)
                    }
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Grid>
      </Card>

      <CourierFormDialog open={openForm} setOpen={setOpenForm} editData={editData} />
    </div>
  )
}

export default CouriersPage
