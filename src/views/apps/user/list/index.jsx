'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'
import { useDispatch, useSelector } from 'react-redux'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'
import { useEffect } from 'react'

const UserList = () => {
  // Hooks
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
        <UserListCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={allUsers} />
      </Grid>
    </Grid>
  )
}

export default UserList
