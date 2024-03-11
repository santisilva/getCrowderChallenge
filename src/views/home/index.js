import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {useContext, useState} from 'react';
import TickersContext from '../../context/TickersContext';
import {Ticker} from '../../components';
const Home = () => {
  const [tickerSelected, setTickerSelected] = useState('');
  const {tickers} = useContext(TickersContext);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {!tickerSelected ? (
          <FlatList
            data={tickers}
            keyExtractor={item => item.idToken}
            renderItem={({item}) => (
              <Ticker
                symbol={item.symbol}
                price={item.price}
                setTickerSelected={() => setTickerSelected(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.containerScreen}>
            <View>
              <Ticker
                symbol={tickerSelected.symbol}
                price={tickerSelected.price}
                setTickerSelected={() => setTickerSelected('')}
              />
              <View style={styles.containerDetail}>
                <Text>Currency of origin</Text>
                <Text>{tickerSelected.currencyOrigin}</Text>
              </View>
              <View style={styles.containerDetail}>
                <Text>Currency of destination</Text>
                <Text>{tickerSelected.currencyDestination}</Text>
              </View>
              <View style={styles.containerDetail}>
                <Text>Change 24 hrs</Text>
                <Text>{tickerSelected.change}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setTickerSelected('')}
              style={styles.button}>
              <Text>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    borderRadius: 8,
  },
  containerScreen: {
    width: '100%',
    justifyContent: 'space-between',
    height: '100%',
  },
  containerDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
