/* eslint-disable react/react-in-jsx-scope */
import {createContext, useEffect, useState} from 'react';
import SQLite from 'react-native-sqlite-storage';
const TickersContext = createContext({});

const infoDatabase = {
  name: 'tickers',
  version: '1.0',
  displayName: 'Tickers Database',
};

export function TickersContextProvider({children}) {
  const [tickers, setTickers] = useState([]);
  const [db, setDb] = useState(null);
  const [tablesCreated, setTablesCreated] = useState(false);

  const onSuccessDatabase = () => {
    console.log('Database opened');
  };
  const onErrorDatabase = error => {
    console.log('Error', error);
  };

  useEffect(() => {
    //SQLite.deleteDatabase(infoDatabase);
    const dbLocal = SQLite.openDatabase(
      infoDatabase,
      onSuccessDatabase,
      onErrorDatabase,
    );

    setDb(dbLocal);
  }, []);

  useEffect(() => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ticker
          (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            symbol TEXT NOT NULL, 
            price DECIMAL(35,8) NOT NULL, 
            idToken INTEGER NOT NULL UNIQUE,
            currencyOrigin TEXT NOT NULL,
            currencyDestination TEXT NOT NULL,
            change TEXT NOT NULL
          )`,
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM ticker',
              [],
              (tx, results) => {
                const len = results.rows.length;
                const tickersLocal = [];
                for (let i = 0; i < len; i++) {
                  const row = results.rows.item(i);
                  tickersLocal.push(row);
                }
                setTickers(tickersLocal);
              },
              (tx, error) => {
                console.log('Error', error);
              },
            );
            setTablesCreated(true);
          },
          error => {
            console.log('Error creating table:', error);
          },
        );
      });
    }
  }, [db]);

  const updateOrInsertIfNotExistsTicker = async (ticker, tx) => {
    tx.executeSql(
      `SELECT * FROM ticker WHERE idToken = ?`,
      [ticker.idToken],
      (tx, results) => {
        if (results && results.rows.length > 0) {
          tx.executeSql(
            `UPDATE ticker 
              SET price = ?,  
              symbol = ?,
              currencyOrigin = ?,
              currencyDestination = ?,
              change = ?
             WHERE idToken = ?`,
            [ticker.price, ticker.symbol, ticker.idToken],
            () => {
              console.log('Ticker updated');
            },
            (tx, error) => {
              console.log('Error', error);
            },
          );
        } else {
          tx.executeSql(
            `INSERT INTO ticker
            (symbol, price, idToken, currencyOrigin, currencyDestination, change) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              ticker.symbol,
              ticker.price,
              ticker.idToken,
              ticker.currencyOrigin,
              ticker.currencyDestination,
              ticker.change,
            ],
            (tx, results) => {
              console.log('Ticker inserted', results);
            },
            (tx, error) => {
              console.log('Error', error);
            },
          );
        }
      },
      (tx, error) => {
        console.log('Error', error);
      },
    );
  };

  const updateTicker = async ticker => {
    db.transaction(async tx => {
      updateOrInsertIfNotExistsTicker(ticker, tx);
    });
  };

  useEffect(() => {
    if (db && tablesCreated) {
      const link = 'wss://api.decrypto.la/websocket/prices/arg';
      const ws = new WebSocket(link);

      ws.onmessage = message => {
        const data = JSON.parse(message.data);
        console.log('Data', data);
        const ticker = {
          idToken: data.currencyToken.id,
          symbol: data.currencyToken.codigo,
          price: data.dca,
          currencyOrigin: data.currencyToken.monedaOrigen.description,
          currencyDestination: data.currencyToken.monedaDestino.description,
          change: data.change,
        };
        console.log('Ticker--', ticker);
        updateTicker(ticker);

        setTickers(prevState => {
          const newState = [...prevState];
          const indexTicker = prevState.findIndex(
            ticker => ticker.idToken === data.currencyToken.id,
          );
          if (indexTicker === -1) {
            newState.push(ticker);
          } else {
            newState[indexTicker] = ticker;
          }
          return newState;
        });
      };
    }
  }, [db, tablesCreated]);

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

export default TickersContext;
