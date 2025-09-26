'use client'

import { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import { Paper } from '@mui/material'

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

const CommentsAndRemarks = ({ order }) => {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showRemarkInput, setShowRemarkInput] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [newRemark, setNewRemark] = useState('')

  const [comments, setComments] = useState(order.comments || [])
  const [remarks, setRemarks] = useState(order.remarks || [])

  // const comments = order?.comments || []
  // const remarks = order?.remarks || []

  const dispatch = useDispatch()

  const handleAddComment = () => {
    if (newComment.trim()) {
      const commentToAdd = newComment.trim()

      setComments(prev => [...prev, commentToAdd])
      setNewComment('')
      dispatch(
        updateOrderCommentsAndRemarks({
          orderId: order.id,
          comments: commentToAdd
        })
      )
        .unwrap()
        .catch(error => {
          console.error('Failed to add comment:', error)
          order.comments = order.comments.filter(c => c !== commentToAdd)
        })
    }
  }

  const handleAddRemark = () => {
    if (newRemark.trim()) {
      const remarkToAdd = newRemark.trim()

      setRemarks(prev => [...prev, remarkToAdd])
      setNewRemark('')

      dispatch(
        updateOrderCommentsAndRemarks({
          orderId: order.id,
          remarks: remarkToAdd
        })
      )
        .unwrap()
        .catch(error => {
          console.error('Failed to add remark:', error)
          order.remarks = order.remarks.filter(r => r !== remarkToAdd)
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
            {getAvatar({ avatar: order?.avatar, agentName: order?.agentName })}
            <Typography variant='body1'>{order?.agentName || 'Unknown Agent'}</Typography>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <Typography variant='h6'>Comments</Typography>
          {comments.length > 0 ? (
            comments.map((c, i) => (
              <Paper key={i} variant='outlined' sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography variant='body2'>{c}</Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  by {order.agentName || 'Unknown Agent'}
                </Typography>
              </Paper>
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
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
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
              <Paper key={i} variant='outlined' sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography variant='body2'>{r}</Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  by {order.agentName || 'Unknown Agent'}
                </Typography>
              </Paper>
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
                onKeyDown={e => e.key === 'Enter' && handleAddRemark()}
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
