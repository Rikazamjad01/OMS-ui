'use client'

// MUI Imports
import { useEffect } from 'react'
import Grid from '@mui/material/Grid2'

// Component Imports
import { useDispatch, useSelector } from 'react-redux'
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'

const UserList = () => {
  // Hooks
  const dispatch = useDispatch()

  const { allUsers, allUsersData } = useSelector(state => state.auth)

  const cardData = allUsersData?.pagination

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
        <UserListCards data={cardData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={allUsers} />
      </Grid>
    </Grid>
  )
}

export default UserList
