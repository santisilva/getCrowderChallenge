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

  //console.log(tickers);

  useEffect(() => {
    if (db) {
      console.log('flag1');
      db.transaction(tx => {
        console.log('flag2');
        // Create table if not exists
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS ticker (id INTEGER PRIMARY KEY AUTOINCREMENT, symbol TEXT NOT NULL, price INTEGER NOT NULL, idToken INTEGER NOT NULL UNIQUE)',
          [],
          () => {
            console.log('flag3');
            console.log('Table created successfully');
            tx.executeSql(
              'SELECT * FROM ticker',
              [],
              (tx, results) => {
                console.log('Results', results);
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
    console.log('Updating or inserting ticker-----');
    console.log('flag7');
    tx.executeSql(
      `SELECT * FROM ticker WHERE idToken = ?`,
      [ticker.idToken],
      (tx, results) => {
        console.log('flag8');
        console.log('Results', results, ticker.idToken);
        if (results && results.rows.length > 0) {
          console.log('flag11');
          tx.executeSql(
            `UPDATE ticker SET price = ?,  symbol = ? WHERE idToken = ?`,
            [ticker.price, ticker.symbol, ticker.idToken],
            () => {
              console.log('Ticker updated');
            },
            (tx, error) => {
              console.log('Error', error);
            },
          );
        } else {
          console.log('flag9');
          tx.executeSql(
            `INSERT INTO ticker (symbol, price, idToken) VALUES (?, ?, ?)`,
            [ticker.symbol, ticker.price, ticker.idToken],
            (tx, results) => {
              console.log('flag12');
              console.log('Ticker inserted', results);
            },
            (tx, error) => {
              console.log('flag10');
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
    console.log('flag5');
    db.transaction(async tx => {
      console.log('flag6');
      updateOrInsertIfNotExistsTicker(ticker, tx);
    });
  };

  useEffect(() => {
    if (db && tablesCreated) {
      const link = 'wss://api.decrypto.la/websocket/prices/arg';
      const ws = new WebSocket(link);
      console.log('flag4');
      ws.onmessage = message => {
        const data = JSON.parse(message.data);
        const ticker = {
          idToken: data.currencyToken.id,
          symbol: data.currencyToken.codigo,
          price: data.dca,
        };
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
