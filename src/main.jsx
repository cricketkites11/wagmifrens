import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { MoralisProvider } from "react-moralis";
import { BrowserRouter } from 'react-router-dom';


ReactDOM.render(
  <React.StrictMode>
      <MoralisProvider appId="s2MzqU3y8OBWPPsd5kPTPNXLw1OFvhPQaalfwOzX" serverUrl="https://4puzjsym712h.usemoralis.com:2053/server">
      
      <App />

      </MoralisProvider>

  </React.StrictMode>,
  document.getElementById('root')
)
