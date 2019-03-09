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
  Image,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import RadialGradient from 'react-native-radial-gradient';
import PlanetView from './Planet';
import { stringToBytes, bytesToString } from 'convert-string';

const windowSize = Dimensions.get('window');

/*
const instructions = Platform.select({
	ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
	android:
	  'TEST::, (CTRL + M) Double tap R on your keyboard to reload,\n' +
	  'Shake or press menu button for dev menu',
  });*/

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
				<View>
					<Image 
						style={styles.bluetooth}
						source={require('romteknologiapp/images/bluetooth.png')}
					/>
				</View>
				<View style={styles.container1}>
					<RadialGradient 
						colors={['white', '#122544']}
						//stops={[0.1,0.4,0.3,0.75]}
						center={[Dimensions.get('window').width / 2, Dimensions.get('window').width / 2]}
						radius={1 /* 300 */}>
					<ScrollView 
						horizontal={true}
						onMomentumScrollBegin={() => console.log("begin")}
						pagingEnabled={true}>
						
						<PlanetView planet="sun" />
						<PlanetView planet="mercury" />
						<PlanetView planet="venus" />
						<PlanetView planet="moon" />
						<PlanetView planet="earth" />
						<PlanetView planet="mars" />
						<PlanetView planet="jupiter" />
						<PlanetView planet="saturn" />
						<PlanetView planet="uranus" />
						<PlanetView planet="neptune" />
						<PlanetView planet="pluto" />

					</ScrollView>
					</RadialGradient>
				</View>
			</View>
			
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#122544',
	},
	container1: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	// backgroundColor: '#F5FCFF',
		//backgroundColor: '#172e54',
		//backgroundColor: '#122544',
	},
	bluetooth: {
		width: 50,
		height: 50,
		tintColor: '#62af87',
	},
});
