import * as React from 'react';
import { StatusBar, Text, useColorScheme, View } from 'react-native';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Toast from 'react-native-toast-message';

import FittingListScreen from './features/fitting-operation-list/screens/FittingListScreen';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPress={() => navigation.navigate('List')}>Go to List</Button>
    </View>
  );
}

const MyDrawer = createDrawerNavigator({
  screens: {
    Home: HomeScreen,
    List: FittingListScreen,
  },
});

const Navigation = createStaticNavigation(MyDrawer);

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Navigation />
      <Toast />
    </>
  );
}
