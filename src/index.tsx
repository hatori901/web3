import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { MoralisProvider } from "react-moralis";

const theme  = extendTheme({
  config: {
    initialColorMode : 'dark'
  }
})

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <MoralisProvider serverUrl="https://wjqhhlvdgol0.usemoralis.com:2053/server" appId="tdwWkuiiWSeYIYznpPft9Qi8DJ8968S1qCFo436h">
      <App />
      </MoralisProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
