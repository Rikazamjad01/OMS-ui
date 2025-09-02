'use client'

import { useState } from 'react'

import { useDispatch } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import { updateOrderCommentsAndRemarks } from '@/redux-store/slices/order'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const getAvatar = ({ avatar, agentName }) => {
  if (avatar) {
    return <CustomAvatar size={40} src={avatar} />
  } else {
    return <CustomAvatar size={40}>{getInitials(agentName || '')}</CustomAvatar>
  }
}

const CommentsAndRemarks = ({ orderData }) => {
  const comments = orderData?.comments || []
  const remarks = orderData?.remarks || []

  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showRemarkInput, setShowRemarkInput] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [newRemark, setNewRemark] = useState('')

  const dispatch = useDispatch()

  const handleAddComment = () => {

    if (newComment.trim()) {
      dispatch(
        updateOrderCommentsAndRemarks({
          orderId: orderData,
          comments: newComment.trim(),
          remarks: undefined // Keep existing remarks
        })
      )
        .unwrap()
        .then(() => {
          setNewComment('')
          setShowCommentInput(false)
        })
        .catch(error => {
          console.error('Failed to add comment:', error)
        })
    }
  }

  const handleAddRemark = () => {
    if (newRemark.trim()) {
      dispatch(
        updateOrderCommentsAndRemarks({
          orderId: orderData.id,
          remarks: newRemark.trim(),
          comments: undefined // Keep existing comments
        })
      )
        .unwrap()
        .then(() => {
          setNewRemark('')
          setShowRemarkInput(false)
        })
        .catch(error => {
          console.error('Failed to add remark:', error)
        })
    }
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        {/* Title */}
        <Typography variant='h5'>Order Comments & Remarks</Typography>

        {/* Agent Info */}
        <div>
          <Typography variant='h6'>Agent</Typography>
          <div className='flex items-center gap-3 mt-2'>
            {getAvatar({ avatar: orderData?.avatar, agentName: orderData?.agentName })}
            <Typography variant='body1'>{orderData?.agentName || 'Unknown Agent'}</Typography>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <Typography variant='h6'>Comments</Typography>
          {comments.length > 0 ? (
            comments.map((c, i) => (
              <Typography key={i} variant='body2' color='text.secondary'>
                - {c}
              </Typography>
            ))
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No comments available
            </Typography>
          )}

          {showCommentInput ? (
            <div className='flex items-center gap-2 mt-2'>
              <TextField
                size='small'
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder='Enter comment'
                label='Comment'
              />
              <Button variant='contained' size='small' onClick={handleAddComment}>
                Add
              </Button>
              <Button variant='outlined' size='small' onClick={() => setShowCommentInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant='outlined' size='small' sx={{ mt: 1 }} onClick={() => setShowCommentInput(true)}>
              + Add Comment
            </Button>
          )}
        </div>

        {/* Remarks Section */}
        <div>
          <Typography variant='h6'>Remarks</Typography>
          {remarks.length > 0 ? (
            remarks.map((r, i) => (
              <Typography key={i} variant='body2' color='text.secondary'>
                - {r}
              </Typography>
            ))
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No remarks available
            </Typography>
          )}

          {showRemarkInput ? (
            <div className='flex items-center gap-2 mt-2'>
              <TextField
                size='small'
                value={newRemark}
                onChange={e => setNewRemark(e.target.value)}
                placeholder='Enter remark'
              />
              <Button variant='contained' size='small' onClick={handleAddRemark}>
                Add
              </Button>
              <Button variant='outlined' size='small' onClick={() => setShowRemarkInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant='outlined' size='small' sx={{ mt: 1 }} onClick={() => setShowRemarkInput(true)}>
              + Add Remark
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CommentsAndRemarks
