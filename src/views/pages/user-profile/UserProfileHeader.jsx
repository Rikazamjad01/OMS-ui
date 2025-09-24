// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const UserProfileHeader = ({ data }) => {

  console.log(data, 'data in user profile header')

  return (
    <Card>
      <CardMedia image={data?.coverImg} className='bs-[250px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
          <img height={120} width={120} src={'/images/avatars/placeholder.jpg'} className='rounded' alt='Profile Background' />
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{data?.firstName} {data?.lastName}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.role && <i className='bx bx-user' />}
                <Typography className='font-medium'>{data?.role?.name}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='bx-map' />
                <Typography className='font-medium'>Pakistan</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='bx-calendar' />
                <Typography className='font-medium'>{new Date(data?.createdAt).toLocaleString()}</Typography>
              </div>
            </div>
          </div>
          <Button variant='contained' className='flex gap-2'>
            <i className='bx-user-check !text-base'></i>
            {/* if isVerified == true then show connected else show disconnected */}
            {data?.isVerified ? (
              <span>Connected</span>
            ) : (
              <span>Disconnected</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
