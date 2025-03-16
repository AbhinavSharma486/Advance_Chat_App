import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from "react-redux";
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from "./redux/store.js";

createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </PersistGate>
);
