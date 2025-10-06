import { registerRootComponent } from 'expo';

// Compatibility shims (polyfills) for older libraries
import './src/shims/dimensionsShim';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
