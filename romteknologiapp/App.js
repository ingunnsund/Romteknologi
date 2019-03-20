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
  TextInput,
  ViewPagerAndroid,
  Picker,
} from 'react-native';
import Slider from "react-native-slider";
import { BleManager } from 'react-native-ble-plx';
import RadialGradient from 'react-native-radial-gradient';
import PlanetView from './components/Planet';
import Arrow from './components/Arrow';
import { stringToBytes, bytesToString } from 'convert-string';
import base64 from 'react-native-base64'

const windowSize = Dimensions.get('window');


/*
Reload: adb shell input text "RR"
Dev menu: adb shell input keyevent 82
*/


// Sett timeout ved sending
// Disable send knapp hvis bluetooth er av

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
			content: windowSize.width*4, 
			text: '0.1',
			bluetoothSymbol: '#990000',
			page: 1,
			sliderValue: 0.4,
			buttonDisable: true,
			connect: "Not connected",
		}

		this.handleArrowScroll = this.handleArrowScroll.bind(this);
		this.handlePlanetScroll = this.handlePlanetScroll.bind(this);
	 
		this.prefixUUID = "0000ffe"
		this.suffixUUID = "-0000-1000-8000-00805f9b34fb"
	}

	serviceUUID() {
		return this.prefixUUID + "0" + this.suffixUUID
	}

	characteristicWUUID() {
		return this.prefixUUID + "1" + this.suffixUUID
	}

	characteristicNUUID() {
		return this.prefixUUID + "1" + this.suffixUUID
	}

	info(message) {
		this.setState({info: message})
	}

	error(message) {
		this.setState({info: "ERROR: " + message})
		this.bluetoothOff();
	}

	updateValue(key, value) {
		this.setState({values: {...this.state.values, [key]: value}})
	}

	bluetoothOn(connectionText) {
		this.setState({bluetoothSymbol: '#FFFFFF'});
		this.setState({buttonDisable: false});
		this.setState({connect: connectionText});
	}

	bluetoothOff() {
		this.setState({bluetoothSymbol: '#990000'});
		this.setState({buttonDisable: true});
		this.setState({connect: "Not connected"});
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

			if (device.id === "88:3F:4A:EF:85:1B") {
				// App: 88:3F:4A:EF:85:1B
				// Topp modul: 18:62:E4:3D:F0:73
				// Bluno

				// Stop scanning 
				this.manager.stopDeviceScan();

				device.connect().then((device) => {
					connectionText = "Connected to " + device.name;
					console.log(connectionText);
					this.bluetoothOn(connectionText);

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
		this.setState({buttonDisable: true});
		setTimeout(() => {
			this.setState({buttonDisable: false});
		}, 2000);
	}

	handleArrowScroll(event) {
		if(event === 0) {
			this.setState({leftOpacity: 0});
		} else if(event === 10) {
			this.setState({rightOpacity: 0});
		} else {
			this.setState({leftOpacity: 0.5});
			this.setState({rightOpacity: 0.5});
		}
	}

	handlePlanetScroll(event) {
		this.handleArrowScroll(event);
		this.setState({sliderValue: Number((event/10).toFixed(1))});
	}

	handleSliderScroll(value) {
		newPage = Number((value).toFixed(1))*10;
		this.refs.planetScroll.setPage(newPage);
		this.handleArrowScroll(newPage);
	}
	// TODO: merkur -> sol, slide til merkur -> sol. 

	render() {
		let values = [];
		let max = 4;
		let min = 0;

		for(let i = min*10; i <= max*10; i++){
			values.push(
				<Picker.Item label={(i/10).toFixed(1).toString()} value={(i/10).toFixed(1).toString()} key={(i/10).toFixed(1).toString()} />
			)
		}
		return (
			<View style={styles.container}>
				<StatusBar
					backgroundColor="#0b172b"
					barStyle="light-content"
				/>
				<View style={styles.bluetoothContainer}>
					<Image 
						style={[styles.bluetooth, {tintColor: this.state.bluetoothSymbol}]}
						source={require('romteknologiapp/images/bluetooth.png')}
					/>
					<Text style={[styles.text/*, {position: 'absolute'}*/]}>
						{(this.state.connect)}
					</Text>
				</View>
				<Text style={styles.text}>
					Trykk på en planet eller velg verdi for å sette G
				</Text>
				<View style={styles.container1}>
					<ViewPagerAndroid
						ref="planetScroll"
						style={styles.viewPager}
						initialPage={4}
						onPageSelected={(page) => {
							this.handlePlanetScroll(page.nativeEvent.position)
						}}>
						<View key="1"> 
							<PlanetView planet="sun" />
						</View>
						<View key="2">
							<PlanetView planet="mercury" />
						</View>
						<View key="3">
							<PlanetView planet="venus" />
						</View>
						<View key="4">
							<PlanetView planet="moon" />
						</View>
						<View key="5">
							<PlanetView planet="earth" />
						</View>
						<View key="6">
							<PlanetView planet="mars" />
						</View>
						<View key="7">
							<PlanetView planet="jupiter" />
						</View>
						<View key="8">
							<PlanetView planet="saturn" />
						</View>
						<View key="9">
							<PlanetView planet="uranus" />
						</View>
						<View key="10">
							<PlanetView planet="neptune" />
						</View>
						<View key="11">
							<PlanetView planet="pluto" />
						</View>
					</ViewPagerAndroid>

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
					<Slider 
						step={1/10}
						//thumbTintColor='blue'
						//style={{thumbTintColor='blue'}}
						thumbTouchSize={{width: 60, height: 60}}
						thumbImage={require('romteknologiapp/images/earth.png')}
						thumbStyle={styles.thumb}
						ref="slider"
						value={this.state.sliderValue}
						minimumTrackTintColor='#bababa'
						maximumTrackTintColor='#bababa'
						style={styles.slider}
						thumbTintColor='#FFFFFF'
						onValueChange={(value) =>
							this.handleSliderScroll(value)}>
					</Slider>
					<Text style={styles.text}>{this.state.info}</Text>
					<Text style={styles.text}>
						{(this.state.values[this.characteristicNUUID()] || "Test")}
					</Text>
					<Picker
						selectedValue={this.state.language}
						style={{height: 50, width: 100, backgroundColor: '#FFFFFF'}}
						onValueChange={(itemValue, itemIndex) => {
							this.setState({language: itemValue});
							this.setState({text: itemValue});
						}}>
						{ values }
					</Picker>
					<Button 
						title="Send"
						disabled={this.state.buttonDisable}
					 	onPress={() =>  this.sendData((this.state.text))} />
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
		flex: 0,
		justifyContent: 'center',
		alignItems: 'center',
		height: windowSize.width * 8/10,
		//backgroundColor: '#F5FCFF',
	},
	bluetoothContainer: {
		flexDirection: 'row',	
		alignItems: 'center',
	},
	bluetooth: {
		width: 30,
		height: 30,
	},
	arrowLeft: {
		position: 'absolute',
		right: windowSize.width * 2/5,
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 2/5,
	},
	arrow1: {
		width: windowSize.width * 2/20,
		height: windowSize.height * 2/20, 
		tintColor: '#FFFFFF',
		// https://www.flaticon.com/free-icon/left-arrow_271220
		// https://www.flaticon.com/free-icon/right-arrow_271228 
	},	
	text: {
		color: '#FFFFFF',
		fontFamily: 'OpenSans-Regular',
	},
	thumb: {
		width: 60,
		height: 60,
		//shadowColor: 'black',
		//shadowOffset: {width: 0, height: 1},
		//shadowOpacity: 0.5,
		//shadowRadius: 1,
	  },
	slider: {
		//color: '#6addaf'
	},
	input: {
		backgroundColor: '#FFFFFF'
	},
	viewPager: {
		flex: 1,
		width: windowSize.width,
		justifyContent: 'center',
    	alignItems: 'center',
	  },
	  pageStyle: {
		alignItems: 'center',
		padding: 50,
	  },
});
