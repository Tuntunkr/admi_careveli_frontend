import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../store/userSlice'
export default configureStore({
  reducer: userReducer,
})