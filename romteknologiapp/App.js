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
import base64 from 'react-native-base64'


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

		this.state = {info: "", values: {}}

		this.prefixUUID = "0000dfb"
		this.suffixUUID = "-0000-1000-8000-00805f9b34fb"

	}
	serviceUUID() {
		return this.prefixUUID + "0" + this.suffixUUID
	}

	notifyUUID(num) {
		return this.prefixUUID + "1" + this.suffixUUID
	}

	writeUUID(num) {
		return this.prefixUUID + "2" + this.suffixUUID
	}	
	info(message) {
		this.setState({info: message})
	}

	error(message) {
		this.setState({info: "ERROR: " + message})
	}

	updateValue(key, value) {
		this.setState({values: {...this.state.values, [key]: value}})
	}

	componentWillMount() {
		console.log("test1");
		const subscription = this.manager.onStateChange((state) => {
			console.log("test2");
			console.log(state);
			if (state === 'PoweredOn') {
				console.log("Test");
				this.scanAndConnect();
				subscription.remove();
			} else {
				console.log("Bluetooth is powered off");
			}
		}, true);
	}

	componentDidMount() {

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
				console.log(error);
				return
			}

			if (device.name === 'Bluno') {
				// TODO && MAC address
							
				// Stop scanning 
				this.manager.stopDeviceScan();

				device.connect().then((device) => {
					console.log("Connected to " + device.name);
					// TODO change bluetooth symbol					

					return device.discoverAllServicesAndCharacteristics();
				}).then((device) => {
					this.info("Setting notifications")
					return this.setupNotifications(device)
				}).then(() => {
					this.info("Listening...")
				}, (error) => {
					this.error(error.message)
				})
			}
		});
	}

	async setupNotifications(device) {
		const service = this.serviceUUID()
		const characteristicW = this.writeUUID()
		const characteristicN = this.notifyUUID()
	
		const characteristic = await device.writeCharacteristicWithResponseForService(
			service, characteristicW, "SGVp")
	
		device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
			if (error) {
			this.error(error.message)
			return
			}
			this.updateValue(characteristic.uuid, base64.decode(characteristic.value))
		})
	}


	handleScroll(event) {
		//console.log(windowSize.width*10);
		//8448
		//7680
		//console.log(event.nativeEvent.contentOffset.x);

		
		if(event.nativeEvent.contentOffset.x < windowSize.width/2) {
			//console.log('Sol');
			styles.arrowLeft.opacity = 0;
		} else if(event.nativeEvent.contentOffset.x > windowSize.width*9.5) {
			//console.log('Pluto');
			styles.arrowRight.opacity = 0;
		} else {
			styles.arrowLeft.opacity = 1;
			styles.arrowRight.opacity = 1;
		}
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
					<ScrollView onScroll={this.handleScroll}
						horizontal={true}
						onMomentumScrollEnd={() => console.log("end scroll")}
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
					<View style={styles.arrowLeft}>
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
				<View>
					<Text style={styles.text1}>{this.state.info}</Text>
					<Text style={styles.text1}>
						{(this.state.values[this.notifyUUID()] || "-")}
					</Text>
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
		//backgroundColor: '#F5FCFF',
		//backgroundColor: '#172e54',
		//backgroundColor: '#122544',
	},
	bluetooth: {
		width: 50,
		height: 50,
		tintColor: '#990000',
		//tintColor: '#62af87',
	},
	arrowLeft: {
		position: 'absolute',
		right: windowSize.width * 2/5,
		
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 2/5,
		opacity: 1,
	},
	arrow1: {
		width: windowSize.width * 2/20,
		height: windowSize.width * 2/20, 
		tintColor: '#FFFFFF',
		// https://www.flaticon.com/free-icon/left-arrow_271220
		// https://www.flaticon.com/free-icon/right-arrow_271228 
	},	
	text1: {
		color: '#FFFFFF',
	},
});
