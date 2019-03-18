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
  Keyboard,
  StatusBar,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import RadialGradient from 'react-native-radial-gradient';
import PlanetView from './Planet';
import { stringToBytes, bytesToString } from 'convert-string';
import base64 from 'react-native-base64'

const windowSize = Dimensions.get('window');

/*
Reload: adb shell input text "RR"
Dev menu: adb shell input keyevent 82
*/

export default class App extends Component {
	constructor(){
		super()

		this.manager = new BleManager();

		this.state = {
			info: "", 
			values: {},
			rightOpacity: 1,
			leftOpacity: 1,
			device: "",
		}

		this.handleScroll = this.handleScroll.bind(this);
		this.scroll = null;
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
	 
		this.prefixUUID = "0000ffe"
		this.suffixUUID = "-0000-1000-8000-00805f9b34fb"
	}

	serviceUUID() {
		return this.prefixUUID + "0" + this.suffixUUID
	}

	characteristicWUUID(num) {
		return this.prefixUUID + "1" + this.suffixUUID
	}

	characteristicNUUID(num) {
		return this.prefixUUID + "1" + this.suffixUUID
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

	componentWillUnmount () {
		this.keyboardDidShowListener.remove();
	  }
	
	  _keyboardDidShow() {
		this.scroll.scrollToEnd();
	  }

	componentWillMount() {
		const subscription = this.manager.onStateChange((state) => {
			if (state === 'PoweredOn') {
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

			if (device.id === "18:62:E4:3D:F0:73") {//device.name === 'Bluno') {
				// TODO && MAC address

				// Stop scanning 
				this.manager.stopDeviceScan();

				device.connect().then((device) => {
					console.log("Connected to " + device.name);
					// TODO change bluetooth symbol					

					return device.discoverAllServicesAndCharacteristics();
				}).then((device) => {
					this.info("Setting notifications")
					this.setState({device: device})
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
		const characteristic = this.characteristicNUUID()		
	
		device.monitorCharacteristicForService(service, characteristic, (error, characteristic) => {
			if (error) {
				this.error(error.message)
				return
			}
			this.updateValue(characteristic.uuid, base64.decode(characteristic.value))
			console.log("Received: " + base64.decode(characteristic.value))
		})
	}

	sendData(data) {
		const service = this.serviceUUID();
		const characteristic = this.characteristicWUUID();
		
		this.state.device.writeCharacteristicWithResponseForService(service, characteristic, base64.encode(data)).then(ch => {
			console.log("Sent: " + base64.decode(ch.value));

		}).catch(error => {
			console.log(error);
		});
	}

	handleScroll(event) {
		if(event.nativeEvent.contentOffset.x < windowSize.width/2) {
			this.setState({leftOpacity: 0});
		} else if(event.nativeEvent.contentOffset.x > windowSize.width*9.5) {
			this.setState({rightOpacity: 0});
		} else {
			this.setState({leftOpacity: 0.5});
			this.setState({rightOpacity: 0.5});
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<StatusBar
					backgroundColor="#0b172b"
					barStyle="light-content"
				/>
				<View>
					<Image 
						style={styles.bluetooth}
						source={require('romteknologiapp/images/bluetooth.png')}
					/>
				</View>
				<View style={styles.container1}>
					<ScrollView onScroll={this.handleScroll}
						horizontal={true}
						//onMomentumScrollEnd={() => console.log("end scroll")}
						onMomentumScrollEnd={(scroll) => {this.scroll = scroll;}}
						pagingEnabled={true}
						>
						
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
					<View style={[styles.arrowLeft, {opacity: this.state.leftOpacity}]}>
						<Image 
							style={styles.arrow1}
							source={require('romteknologiapp/images/left-arrow.png')}
							/>
					</View>
					<View style={[styles.arrowRight, {opacity: this.state.rightOpacity}]}>
						<Image 
							style={styles.arrow1}
							source={require('romteknologiapp/images/right-arrow.png')}
							/>
					</View>
					</Arrow >
				</View>
				<View>
					<Text style={styles.text}>{this.state.info}</Text>
					<Text style={styles.text}>
						{(this.state.values[this.characteristicNUUID()] || "Test")}
					</Text>
					<Button title="Send" onPress={() => this.sendData("Testdata")} />
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
		//opacity: App.state.leftOpacity,
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 2/5,
		//opacity: App.state.rightOpacity,
	},
	arrow1: {
		width: windowSize.width * 2/20,
		height: windowSize.width * 2/20, 
		tintColor: '#FFFFFF',
		// https://www.flaticon.com/free-icon/left-arrow_271220
		// https://www.flaticon.com/free-icon/right-arrow_271228 
	},	
	text: {
		color: '#FFFFFF',
		fontFamily: 'OpenSans-Regular',
	}
});
