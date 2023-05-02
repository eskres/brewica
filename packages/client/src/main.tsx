import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import Home from './app/Home/Home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
      <Home />
  </StrictMode>
);
