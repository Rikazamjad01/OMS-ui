'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'
import UserListTable from '../user/list/UserListTable'
import { useDispatch, useSelector } from 'react-redux'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'
import { useEffect } from 'react'

const Roles = ({ userData }) => {
  const dispatch = useDispatch()
  const { allUsers } = useSelector(state => state.auth)

  useEffect(() => {
    const params = {
      page: 1,
      limit: 10
    }
    dispatch(getAlUsersThunk({ params, force: true }))
  }, [])
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Roles List
        </Typography>
        <Typography>
          A role provided access to predefined menus and features so that depending on assigned role an administrator
          can have access to what he need
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RoleCards />
      </Grid>
      <Grid size={{ xs: 12 }} className='!pbs-6'>
        <Typography variant='h4' className='mbe-1'>
          Total users with their roles
        </Typography>
        <Typography>Find all of your company&#39;s administrator accounts and their associate roles.</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={allUsers} />
      </Grid>
    </Grid>
  )
}

export default Roles
