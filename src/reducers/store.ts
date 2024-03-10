import { configureStore } from '@reduxjs/toolkit'
import Sale from './Sale'

export default configureStore({
  reducer: {
    sale: Sale
  }
})