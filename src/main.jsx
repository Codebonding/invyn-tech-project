
import { StrictMode } from 'react'
import { Provider } from "react-redux";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from "./store/store.js"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import { BrowserRouter } from "react-router-dom"

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
