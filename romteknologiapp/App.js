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
  Animated,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import RadialGradient from 'react-native-radial-gradient';
import PlanetView from './Planet';
import { stringToBytes, bytesToString } from 'convert-string';

const windowSize = Dimensions.get('window');
// TODO skru av liggende 

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
					// TODO change bluetooth symbol

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
					<ScrollView 
						horizontal={true}
						onMomentumScrollEnd={() => console.log("end")}
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
					
					<Arrow>
					<View style={styles.arrow}>
						<Image 
							style={styles.arrow1}
							source={require('romteknologiapp/images/left-arrow.png')}
							/>
					</View>
					<View style={styles.arrowRight}>
						<Image 
							style={styles.arrow1}
							source={require('romteknologiapp/images/right-arrow.png')}
							/>
					</View>
					</Arrow >
				</View>
				
			</View>
			
		);
	}
}

let off = 1;
class Arrow extends React.Component {
	state = {
	  fadeAnim: new Animated.Value(0.2),  
	}
  
	componentDidMount() {
		off *= -1;
		this.runAnimation(0.6); 
	}

	runAnimation(end) {
		
		Animated.timing(                
			this.state.fadeAnim, 
			{
			  toValue: end,  
			  duration: 1000,
			}
		  ).start(() => {
			
			if(off === -1) {
				off *= -1;
				this.runAnimation(0.2)
			} else {
				off *= -1;
				this.runAnimation(0.6)
			}
		  });    
	}
  
	render() {
	  let { fadeAnim } = this.state;
  
	  return (
		<Animated.View                 // Special animatable View
		  style={{/*...styles.arrow, */opacity: fadeAnim, position: 'absolute'}}
		>
		  {this.props.children}
		</Animated.View>
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
		tintColor: '#990000',
		//tintColor: '#62af87',
	},
	arrow: {
		position: 'absolute',
		right: windowSize.width * 2/5,
		
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 2/5,
	},
	arrow1: {
		width: windowSize.width * 2/20,
		height: windowSize.width * 2/20, 
		tintColor: '#FFFFFF',
		// https://www.flaticon.com/free-icon/left-arrow_271220
		// https://www.flaticon.com/free-icon/right-arrow_271228 
	},	
});
