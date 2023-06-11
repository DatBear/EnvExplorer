import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SearchContextProvider } from './Components/Contexts/SearchContext';
import { ToastContextProvider } from './Components/Contexts/ToastContext';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <SearchContextProvider>
      <ToastContextProvider>
        <App />
      </ToastContextProvider>
    </SearchContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
