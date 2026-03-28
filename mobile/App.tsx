import React from 'react';
import { AppRegistry } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { name as appName } from './app.json';

// Register the main component
AppRegistry.registerComponent(appName, () => App);

function App() {
  return <AppNavigator />;
}

export default App;
