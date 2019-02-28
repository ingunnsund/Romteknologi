import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ListView,
  ScrollView,
  AppState,
  Dimensions,
  Button,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

import { stringToBytes, bytesToString } from 'convert-string';


const window = Dimensions.get('window');


const instructions = Platform.select({
	ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
	android:
	  'TEST::, (CTRL + M) Double tap R on your keyboard to reload,\n' +
	  'Shake or press menu button for dev menu',
  });
  


export default class App extends Component {
  constructor(){
	super()

	this.manager = new BleManager();


	this.state = {
	  scanning:false,
	  peripherals: new Map(),
	  appState: ''
	}

  }

  componentDidMount() {
	
	/*const subscription = this.manager.onStateChange((state) => {
	  if (state === 'PoweredOn') {
		  this.scanAndConnect();
		  subscription.remove();
	  }
 	}, true);*/
	


	if (Platform.OS === 'android' && Platform.Version >= 23) {
		PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
			if (result) {
			  console.log("Permission is OK");
			} else {
			  PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
				if (result) {
				  console.log("User accept");
				} else {
				  console.log("User refuse");
				}
			  });
			}
	  });
	}

  }

  scanAndConnect() {
	this.manager.startDeviceScan(null, null, (error, device) => {
		if (error) {
			// Handle error (scanning will be stopped automatically)
			console.log(error);
			return
		}

		// Check if it is a device you are looking for based on advertisement data
		// or other criteria.
		if (device.name === 'Bluno') {
			// TODO && MAC address
			
			console.log("OK");
			// Stop scanning as it's not necessary if you are scanning for one device.
			this.manager.stopDeviceScan();

			// Proceed with connection.

			device.connect()
			  .then((device) => {
				  console.log("Connected");

				  device.discoverAllServicesAndCharacteristics().then((result) => {
					console.log(result);
				  }).catch((error) => {
					console.log(error);
				  });
			  })
			  .then((device) => {
				console.log("conn");
				// Do work on device with services and characteristics
			  })
			  .catch((error) => {
				console.log(error);
				  // Handle errors
			  });
		}
	});
}


 

render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <Button onPress={() => console.log("hihi")} title="Click me" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   // backgroundColor: '#F5FCFF',
	//backgroundColor: '#172e54',
	backgroundColor: '#122544',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    //color: '#333333',
    color: '#FFFFFF',
    marginBottom: 5,
  },
});
