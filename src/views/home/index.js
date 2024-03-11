import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React, {useContext} from 'react';
import TickersContext from '../../context/TickersContext';
import {Ticker} from '../../components';
const Home = () => {
  const {tickers} = useContext(TickersContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {tickers &&
        tickers.map((ticker, index) => (
          <Ticker key={index} symbol={ticker.symbol} price={ticker.price} />
        ))}
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
});
