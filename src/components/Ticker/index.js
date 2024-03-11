import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

/**
  @param {string} symbol - The symbol of the ticker
  @param {number} price - The price of the ticker
  @param {function} setTickerSelected - Function to set the selected ticker
 */

const Ticker = ({symbol, price, setTickerSelected}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={setTickerSelected}>
      <Text>{symbol}</Text>
      <Text>{price}</Text>
    </TouchableOpacity>
  );
};

export default Ticker;

Ticker.propTypes = {
  symbol: PropTypes.string,
  price: PropTypes.number,
  setTickerSelected: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
