'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import RoleDialog from '@components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import Link from '@components/Link'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getAllRoles } from '@/redux-store/slices/roleSlice'
import { checkPermission } from '@/hooks/Permissions'

const RoleCards = () => {
  // Vars
  const canEditRole = checkPermission('role.update')

  const typographyProps = {
    children: 'Edit Role',
    component: Link,
    color: 'primary.main',
    onClick: e => e.preventDefault(),
    disabled: !canEditRole
  }

  const canAddRole = checkPermission('role.create')
  console.log(canEditRole, 'canEditRole')
  const CardProps = {
    className: 'cursor-pointer bs-full',
    children: (
      <Grid container className='bs-full'>
        <Grid size={{ xs: 6 }}>
          <div className='flex items-end justify-center bs-full'>
            <img alt='add-role' src='/images/illustrations/characters/1.png' height={130} />
          </div>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <CardContent>
            <div className='flex flex-col items-end gap-4 text-right'>
              <Button variant='contained' size='small' disabled={!canAddRole}>
                Add New Role
              </Button>
              <Typography>
                Add new role, <br />
                if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    )
  }

  const dispatch = useDispatch()
  const { roles } = useSelector(state => state.role)

  useEffect(() => {
    dispatch(getAllRoles({ params: { page: 1, limit: 100 }, force: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Grid container spacing={6}>
        {roles?.map((role, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={role?._id || index}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  {/* <Typography className='flex-grow'>{`Total ${role.totalUsers ?? 0} users`}</Typography> */}
                </div>
                <div className='flex justify-between items-start'>
                  <div className='flex flex-col items-start gap-1'>
                    <Typography variant='h5' className='capitalize'>
                      {role?.name}
                    </Typography>
                    {role?.description ? (
                      <Typography variant='body2' className='text-textSecondary'>
                        {role.description}
                      </Typography>
                    ) : null}
                    <Typography variant='caption' className='text-textDisabled'>
                      Scope: {role?.scope?.type || '—'}
                    </Typography>
                    {canEditRole && (
                      <OpenDialogOnElementClick
                        element={Typography}
                        elementProps={typographyProps}
                        dialog={RoleDialog}
                        dialogProps={{ title: role?.name, role }}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {canAddRole ? (
            <OpenDialogOnElementClick element={Card} elementProps={CardProps} dialog={RoleDialog} />
          ) : (
            <Card {...CardProps} />
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default RoleCards
