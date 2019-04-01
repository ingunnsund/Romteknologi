import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  Modal,
  Alert,
  Slider,
} from 'react-native';
//import Slider from "react-native-slider";
import { BleManager, Subscription } from 'react-native-ble-plx';
import RadialGradient from 'react-native-radial-gradient';
import PlanetView from './components/Planet';
import Arrow from './components/Arrow';
import base64 from 'react-native-base64'

const windowSize = Dimensions.get('window');
const planetNumber = 10;
const initialPlanet = 3;
const transactionID = '0';

/*
Debug commands:
Reload: adb shell input text "RR"
Dev menu: adb shell input keyevent 82
*/


// Sett timeout ved sending
// Disable send knapp hvis bluetooth er av
// spør om posisjon, deprecatred
// arrow margin11

export default class App extends Component {
	constructor(){
		super()

		this.manager = new BleManager();

		this.state = {
			info: '', 
			values: {},
			rightOpacity: 0.5, //1
			leftOpacity: 0.5, //1
			device: '',
			content: windowSize.width*4, 
			text: '0.1',
			bluetoothSymbol: '#990000',
			page: 1,
			sliderValue: initialPlanet,
			buttonDisable: true,
			connect: 'Not connected',
			modalVisible: false,
		}

		this.handleArrowScroll = this.handleArrowScroll.bind(this);
		this.handlePlanetScroll = this.handlePlanetScroll.bind(this);
		this.pressPlanet = this.pressPlanet.bind(this);
	 
		this.prefixUUID = "0000ffe"
		this.suffixUUID = "-0000-1000-8000-00805f9b34fb"
	}

	serviceUUID() {
		return this.prefixUUID + '0' + this.suffixUUID
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
		}, transactionID);
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
		} else if(event === planetNumber-1) {
			this.setState({rightOpacity: 0});
		} else {
			this.setState({leftOpacity: 0.5});
			this.setState({rightOpacity: 0.5});
		}
	}

	handlePlanetScroll(event) {
		this.handleArrowScroll(event);
		this.setState({sliderValue: event});
	}

	handleSliderScroll(value) {
		this.refs.planetScroll.setPage(value);
		this.handleArrowScroll(value);
		this.setState({sliderValue: value});
	}
	
	handleArrowPress(direction) {
		if(direction === 'Right') {
			this.handlePlanetScroll(this.state.sliderValue + 1);
			this.handleSliderScroll(this.state.sliderValue + 1);
		} else {
			this.handlePlanetScroll(this.state.sliderValue - 1);
			this.handleSliderScroll(this.state.sliderValue - 1);
		}
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible});
	}	

	pressPlanet(value) {
		console.log(value);
		if(!this.state.buttonDisable) {
			this.sendData(value);
		}
	}

	render() {
		let values = [];
		let max = 4;
		let min = 0;

		
		for(let i = min*10; i <= max*10; i++){
			values.push(
				<Picker.Item label={(i/10).toFixed(1).toString()} value={(i/10).toFixed(1).toString()} key={(i/10).toFixed(1).toString()} />
			)
		}
		values.push(
			<Picker.Item label={"-1"} value={"-1"} key={"4.1"} />
		)
		
		//https://www.flaticon.com/free-icon/information_906794#term=question%20mark&page=1&position=2
		//https://www.flaticon.com/free-icon/cancel_126497#term=cross&page=1&position=3
		return (
			<View style={styles.container}>
				<StatusBar
					backgroundColor="#0b172b"
					barStyle="light-content"
				/>
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						console.log('Modal has been closed.');
					}}>
					<TouchableOpacity 
						style={styles.modalContainer} 
						activeOpacity={1} 
						onPressOut={() => {this.setModalVisible(false)}}>

						<ScrollView 
							directionalLockEnabled={true} 
							contentContainerStyle={styles.scrollModal}>
						
							<View style={{
								marginTop: windowSize.width*1/8,
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'}}>
								<TouchableWithoutFeedback>
								<View style={{
									backgroundColor: '#000000',
									width: windowSize.width*4/5,
									height: windowSize.height*4/5,
									borderRadius: 18,
									elevation: 2,
									opacity: 0.6,
									shadowColor: 'black', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16}}>
								
									<TouchableHighlight
										onPress={() => {
										this.setModalVisible(!this.state.modalVisible);
										}}>
										<Image 
											style={styles.cancel}
											source={require('romteknologiapp/images/cancel.png')}
											
										/>
									</TouchableHighlight>
									<Text>Om prosjekt, om tyngdekraft, hvordan bruke appen osv.</Text> 
								</View>
								</TouchableWithoutFeedback>
							</View>
						
						</ScrollView>
					</TouchableOpacity>   
					
				</Modal>
				
				<View style={styles.topContainer}>
					<Image 
						style={[styles.bluetooth, {tintColor: this.state.bluetoothSymbol}]}
						source={require('romteknologiapp/images/bluetooth.png')}
					/>
					<Text style={[styles.text/*, {position: 'absolute'}*/]}>
						{(this.state.connect)}
					</Text>
					<View style={{/*flexDirection: 'row', *//*justifyContent: 'flex-end'*/ position: 'absolute', right: windowSize.width/40}}> 
					<TouchableOpacity
						onPress={() => {
							this.setModalVisible(!this.state.modalVisible);
							this.manager.cancelTransaction(transactionID);
							}}>
						<Image 
							style={styles.question}
							source={require('romteknologiapp/images/question.png')}	
						/>
					</TouchableOpacity>
					
					</View>
					
				</View>
				<View style={styles.titleContainer}>
					<Text style={styles.title}>
						Space Bungalow
					</Text>
				</View>	
				<View style={styles.container1}>
					<ViewPagerAndroid
						ref="planetScroll"
						style={styles.viewPager}
						initialPage={3}
						onPageSelected={(page) => {
							this.handlePlanetScroll(page.nativeEvent.position)
						}}>
						<View key="1">
							<PlanetView planet="mercury" pressPlanet={this.pressPlanet} />
						</View>
						<View key="2">
							<PlanetView planet="venus" pressPlanet={this.pressPlanet} />
						</View>
						<View key="3">
							<PlanetView planet="moon" pressPlanet={this.pressPlanet} />
						</View>
						<View key="4">
							<PlanetView planet="earth" pressPlanet={this.pressPlanet} />
						</View>
						<View key="5">
							<PlanetView planet="mars" pressPlanet={this.pressPlanet} />
						</View>
						<View key="6">
							<PlanetView planet="jupiter" pressPlanet={this.pressPlanet} />
						</View>
						<View key="7">
							<PlanetView planet="saturn" pressPlanet={this.pressPlanet} />
						</View>
						<View key="8">
							<PlanetView planet="uranus" pressPlanet={this.pressPlanet} />
						</View>
						<View key="9">
							<PlanetView planet="neptune" pressPlanet={this.pressPlanet} />
						</View>
						<View key="10">
							<PlanetView planet="spaceStation" pressPlanet={this.pressPlanet} />
						</View>
					</ViewPagerAndroid>

					<Arrow>
						<View style={[styles.arrowLeft, {opacity: this.state.leftOpacity}]}>
							{this.state.leftOpacity !== 0 && 
							<TouchableOpacity
								onPress={() => {
									this.handleArrowPress("Left");
								}}>
								<Image 
									style={styles.arrow1}
									source={require('romteknologiapp/images/left-arrow.png')}
								/>
							</TouchableOpacity>
							}
						</View>
						
						<View style={[styles.arrowRight, {opacity: this.state.rightOpacity}]}>
							{this.state.rightOpacity !== 0 && 
							<TouchableOpacity
								onPress={() => {
									this.handleArrowPress("Right");
								}}>
								<Image 
									style={styles.arrow1}
									source={require('romteknologiapp/images/right-arrow.png')}
								/>
							</TouchableOpacity>
							}
						</View>
					</Arrow >		
				</View>
				<View>
					<Slider 
						step={1}
						maximumValue={planetNumber-1}
						//thumbTintColor='blue'
						//style={{thumbTintColor='blue'}}
						thumbTouchSize={{width: 60, height: 60}}
						//thumbImage={require('romteknologiapp/images/earth.png')}
						//thumbStyle={styles.thumb}
						ref="slider"
						value={this.state.sliderValue}
						minimumTrackTintColor='transparent' //'#bababa'
						maximumTrackTintColor='white'
						//maximumTrackTintColor='transparent'  
                		//minimumTrackTintColor='transparent'
						style={styles.slider}
						thumbTintColor='#FFFFFF'
						onValueChange={(value) =>
							this.handleSliderScroll(value)}>
					</Slider>
					<View style={{/*flexDirection: 'row',*/ alignItems: 'center', justifyContent: 'center', borderColor: 'black', borderRadius: 4,
    borderWidth: 0.5,}}>
						<Text style={[styles.text, {fontSize: 39}]}>Gravitasjonskraft på romstasjonen: </Text>
						<Text style={[styles.text, {fontSize: 39}]}>
							{(this.state.values[this.characteristicNUUID()] || "0") + " g"}
						</Text>
					</View>
					
					
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
	modalContainer: {
		flex: 1,
		/*backgroundColor: '#122544',*/
		justifyContent: 'center',
		alignItems: 'center',
	},
	topContainer: {
		flexDirection: 'row',	
		alignItems: 'center',
		marginTop: windowSize.height * 1/150
	},
	bluetooth: {
		width: 30,
		height: 30,
	},
	question: {
		width: 30,
		height: 30,
		tintColor: '#FFFFFF',
	},
	cancel: {
		width: 30,
		height: 30,
		
	},
	arrowLeft: {
		position: 'absolute',
		right: windowSize.width * 31/80,
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 31/80,//2/5,
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
	title: {
		color: '#FFFFFF',
		fontFamily: 'Orbitron-Regular',
		fontSize: windowSize.width/14,
		marginBottom: windowSize.height/60,
	},
	titleContainer: {
		justifyContent: 'center',
		alignItems: 'center',
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
		height: 30
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
