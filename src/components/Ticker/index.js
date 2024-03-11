import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

/**
  @param {string} symbol - The symbol of the ticker
  @param {number} price - The price of the ticker
 */

const Ticker = ({symbol, price}) => {
  return (
    <View style={styles.container}>
      <Text>{symbol}</Text>
      <Text>{price}</Text>
    </View>
  );
};

export default Ticker;

Ticker.propTypes = {
  symbol: PropTypes.string,
  price: PropTypes.number,
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
