import React, {useEffect, useState} from 'react';
import SQLite from 'react-native-sqlite-storage';

const useTickerDatabaseManager = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const infoDatabase = {
      name: 'tickers',
      version: '1.0',
      displayName: 'Tickers Database',
      //estimatedSize: 2000000,
    };

    const onOpenDatabase = () => {
      console.log('Database opened');
    };

    const onErrorDatabase = error => {
      console.log('Error', error);
    };

    const dbLocal = SQLite.openDatabase(
      infoDatabase,
      onOpenDatabase,
      onErrorDatabase,
    );

    dbLocal.transaction(async tx => {
      // Comprueba si la tabla existe, si no, la crea
      await validateOrCreateTable(tx);

      // Actualiza o inserta el ticker
      await updateOrInsertIfNotExistsTicker(
        {
          id: 2,
          symbol: 'TEST2',
          price: 2000,
        },
        tx,
      );
    });

    setDb(dbLocal);

    return () => {
      dbLocal.close();
    };
  }, []);

  const validateOrCreateTable = async tx => {
    console.log('Validating or creating table-----');
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tickers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price REAL NOT NULL,
      )`,
    );
  };

  const updateOrInsertIfNotExistsTicker = async (ticker, tx) => {
    console.log('Updating or inserting ticker-----');
    tx.executeSql(
      `SELECT * FROM tickers WHERE id = ?`,
      [ticker.id],
      (tx, results) => {
        if (results.rows.length === 0) {
          tx.executeSql(
            `INSERT INTO tickers (symbol, price) VALUES (?, ?, ?)`,
            [ticker.symbol, ticker.price],
            (tx, results) => {
              console.log('Ticker inserted', results);
            },
            (tx, error) => {
              console.log('Error', error);
            },
          );
        } else {
          tx.executeSql(
            `UPDATE tickers SET price = ?,  symbol = ? WHERE id = ?`,
            [ticker.price, ticker.symbol, ticker.id],
            (tx, results) => {
              console.log('Ticker updated', results);
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
    await db.transaction(async tx => {
      // Comprueba si la tabla existe, si no, la crea
      await validateOrCreateTable(tx);

      // Actualiza o inserta el ticker
      await updateOrInsertIfNotExistsTicker(ticker, tx);
    });
  };
  const getAllTickerStatesFromDatabase = async () => {
    try {
      const getAllTickerStatesQuery = `SELECT * FROM tickers `;
      const [results] = await db.executeSql(getAllTickerStatesQuery);
      const tickerStates = results.rows.raw();
      return tickerStates;
    } catch (error) {
      console.error(
        'Error al obtener los estados de los tickers desde la base de datos:',
        error,
      );
      return [];
    }
  };

  return {updateTicker, getAllTickerStatesFromDatabase};
};

export default useTickerDatabaseManager;
