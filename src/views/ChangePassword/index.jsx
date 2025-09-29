'use client'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { styled, useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import cookies from 'js-cookie'
import { changePasswordThunk } from '@/redux-store/slices/authSlice'
import { toast } from 'react-toastify'

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const ForgotPassword = () => {
  // Hooks
  const { lang: locale } = useParams()
  const theme = useTheme()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const minLength = 8
  const dispatch = useDispatch()
  const resetToken = cookies.get('resetToken')
  const router = useRouter()
  useEffect(() => {
    if (!resetToken) {
      router.push(getLocalizedUrl('/login', locale))
    }
  }, [resetToken])

  return (
    <div className='flex bs-full justify-center'>
      <div className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'>
        <ForgotPasswordIllustration
          src='/images/illustrations/characters-with-objects/10.png'
          alt='character-illustration'
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Change Password 🔒</Typography>
            <Typography>Enter your new password</Typography>
          </div>
          <form
            noValidate
            autoComplete='off'
            onSubmit={async e => {
              e.preventDefault()
              // simple client validation
              if (newPassword.length < minLength) return
              if (newPassword !== confirmPassword) return
              // TODO: integrate API call here when ready
              const response = await dispatch(changePasswordThunk({ newPassword, resetToken: resetToken }))
              if (response.payload.success) {
                toast.success('Password changed successfully')
                router.push(getLocalizedUrl('/login', locale))
              }
            }}
            className='flex flex-col gap-6'
          >
            <CustomTextField
              autoFocus
              fullWidth
              type={showNew ? 'text' : 'password'}
              label='New Password'
              placeholder='Enter your new password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              error={newPassword !== '' && newPassword.length < minLength}
              helperText={
                newPassword !== '' && newPassword.length < minLength
                  ? `Password must be at least ${minLength} characters`
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowNew(s => !s)} edge='end' aria-label='toggle password visibility'>
                      <i className={showNew ? 'bx-show' : 'bx-hide'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <CustomTextField
              fullWidth
              type={showConfirm ? 'text' : 'password'}
              label='Confirm New Password'
              placeholder='Re-enter your new password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword !== '' && confirmPassword !== newPassword}
              helperText={confirmPassword !== '' && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowConfirm(s => !s)}
                      edge='end'
                      aria-label='toggle password visibility'
                    >
                      <i className={showConfirm ? 'bx-show' : 'bx-hide'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button fullWidth variant='contained' type='submit'>
              Change Password
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon ltrIconClass='bx-chevron-left' rtlIconClass='bx-chevron-right' className='text-xl' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
