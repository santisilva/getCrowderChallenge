import React from 'react';
import {TickersContextProvider} from './src/context/TickersContext';
import {Home} from './src/views';

const App = () => {
  return (
    <TickersContextProvider>
      <Home />
    </TickersContextProvider>
  );
};

export default App;
