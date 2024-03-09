/* eslint-disable react/react-in-jsx-scope */
import {createContext, useEffect, useState} from 'react';
import useTickerDatabaseManager from '../hooks/useTickerDatabaseManager';
import SQLite from 'react-native-sqlite-storage';
const TickersContext = createContext({});

export function TickersContextProvider({children}) {
  const [tickers, setTickers] = useState([]);
  const {updateTicker, getAllTickerStatesFromDatabase} =
    useTickerDatabaseManager();

  useEffect(() => {
    const infoDatabase = {
      name: 'tickers2',
      version: '1.2',
      displayName: 'Tickers Database2',
      //estimatedSize: 2000000,
    };

    const onOpenDatabase = () => {
      console.log('Database opened2');
    };

    const onErrorDatabase = error => {
      console.log('Error2', error);
    };

    const db = SQLite.openDatabase(
      infoDatabase,
      onOpenDatabase,
      onErrorDatabase,
    );

    db.transaction(async tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tickers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
        )`,
      );
    });
  }, []);

  useEffect(() => {
    updateTicker({
      id: 1,
      symbol: 'TEST',
      price: 2000,
    }).then(() => {
      console.log('Ticker updated');
      getAllTickerStatesFromDatabase().then(tickerStates => {
        console.log('Ticker states', tickerStates);
      });
    }, []);
    const link = 'wss://api.decrypto.la/websocket/prices/arg';
    const ws = new WebSocket(link);
    ws.onmessage = message => {
      const data = JSON.parse(message.data);
      const ticker = {
        id: data.currencyToken.id,
        symbol: data.currencyToken.codigo,
        price: data.dca,
      };

      setTickers(prevState => {
        const newState = [...prevState];
        const indexTicker = prevState.findIndex(
          ticker => ticker.currencyToken.id === data.currencyToken.id,
        );
        if (indexTicker === -1) {
          newState.push(data);
        } else {
          newState[indexTicker] = data;
        }
        return newState;
      });
    };
  }, []);

  //console.log('tickers', tickers);

  return (
    <TickersContext.Provider
      value={{
        tickers,
        setTickers,
      }}>
      {children}
    </TickersContext.Provider>
  );
}
