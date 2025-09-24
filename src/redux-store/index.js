// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import ordersReducer from '@/redux-store/slices/order'
import customerReducer from '@/redux-store/slices/customer'
import productsReducer from '@/redux-store/slices/products'
import bookingReducer from '@/redux-store/slices/bookingSlice'
import zonesReducer from '@/redux-store/slices/zonesSlice'

export const store = configureStore({
  reducer: {
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    orders: ordersReducer,
    customers: customerReducer,
    products: productsReducer,
    booking: bookingReducer,
    zones: zonesReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})
