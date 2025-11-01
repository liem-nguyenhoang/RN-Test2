/**
 * @format
 */

import 'reflect-metadata';

import { AppRegistry } from 'react-native';
// import App from './Nav3';
// import App from './App';
// import App from './List1';
// import App from './OpenURl';
// import DetailView from './SwipeToConfirm/DetailViewTest1'
// import DetailView from './SwipeToConfirm/DetailViewTest1'

import Toast  from './toast/exp'

import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => Toast);
