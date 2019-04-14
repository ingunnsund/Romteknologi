import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  PermissionsAndroid,
  ScrollView,
  Dimensions,
  Button,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import PlanetView from './components/Planet';
import Arrow from './components/Arrow';
import base64 from 'react-native-base64';
import Slider from '@react-native-community/slider';
import {Slider as SliderVertical} from 'react-native-elements';
import {Button as ButtonStop} from 'react-native-elements';
import ViewPagerAndroid from '@react-native-community/viewpager';

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
			connect: 'Ikke tilkoblet',
			modalVisible: false,
			alertVisible: false,
			choiceVisible: false,
			pickerVisible: false,
			data: '',
			chooseValue: 2,
			sendValue: '2.0',
		}

		this.handleArrowScroll = this.handleArrowScroll.bind(this);
		this.handlePlanetScroll = this.handlePlanetScroll.bind(this);
		this.pressPlanet = this.pressPlanet.bind(this);
		this.pressStation = this.pressStation.bind(this);
		this.pressEarth = this.pressEarth.bind(this);
	 
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
		console.log("Fra info");
	}

	error(message) {
		this.setState({info: "ERROR: " + message})
		console.log("Error: " + message);
		// skru av connection
		
		/*cancelDeviceConnection(this.state.device.id).then(() => {
			console.log("Disconnected");
		}).catch((error) => {
			console.log(error)
		});
		this.bluetoothOff();*/
		
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
		
		//this.scanAndConnect();
		this.startup();
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

	startup() {
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
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
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
				console.log(error.message)
				this.manager.isDeviceConnected(this.state.device.id).then((result) => {
					if(!result) {
						this.bluetoothOff();
					}
				}).catch((error) => {
					console.log(error);
				});
				return
			}
			// hvis mindre enn 0 -> print 0
			let decoded = base64.decode(characteristic.value);
			let value = decoded.replace(/(\r\n|\n|\r)/gm, "");
			if(value.includes("-")) {
				value = "0.00";
			}
			this.updateValue(characteristic.uuid, value);
			console.log("Received: " + decoded)
		}, transactionID);

		
	}

	sendData(data) {
		const service = this.serviceUUID();
		const characteristic = this.characteristicWUUID();

		console.log("Sent: " + data);
		if(data !== "-1") {
			this.setState({data: "Sendt " + data + " g til romstasjonen"});
		} else {
			this.setState({data: "Setter romstasjonen skalert for jorden"});
		}
		
		this.state.device.writeCharacteristicWithResponseForService(service, characteristic, base64.encode(data)).then(() => {
			this.setAlertVisible(!this.state.alertVisible);	
		}).catch(error => {
			console.log(error);
		});
		this.setState({buttonDisable: true});
		setTimeout(() => {
			this.setState({buttonDisable: false});
			this.setAlertVisible(false);			
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

	setAlertVisible(visible) {
		this.setState({alertVisible: visible});
	}	
	setChoiceVisible(visible) {
		this.setState({choiceVisible: visible});
	}	
	setPickerVisible(visible) {
		this.setState({pickerVisible: visible});
	}	

	pressPlanet(value) {
		console.log(value);
		if(value !== "-1") {
			this.setState({data: "Sendt " + value + " g til romstasjonen"});
		} else {
			this.setState({data: "Setter rom-stasjon til scale for jorden"});
		}
		
		if(!this.state.buttonDisable) {
			this.sendData(value);
		}
	}
	pressStation(value) {
		this.setPickerVisible(!this.state.pickerVisible);
	}
	pressEarth(value) {
		this.setChoiceVisible(!this.state.choiceVisible);	
	}
	setChooseValue(value) {
		this.setState({chooseValue: value})
	}
	setSendValue(value) {
		this.setState({sendValue: value});
	}

	render() {
		
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
					visible={this.state.modalVisible}>
					<TouchableOpacity 
						style={styles.modalContainer} 
						activeOpacity={1} 
						onPressOut={() => {this.setModalVisible(false)}}>

						<ScrollView 
							directionalLockEnabled={true} 
							contentContainerStyle={styles.scrollModal}>
						
							<View style={{
								marginTop: windowSize.height*1/20, // windowSize.width*1/8,
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'}}>
								<TouchableWithoutFeedback>
									<View style={{
										backgroundColor: '#000000',
										width: windowSize.width*9/10, //4/5
										height: windowSize.height*9/10,
										borderRadius: 18,
										opacity: 0.9,
									}}>
										<View style={{
										
										margin: windowSize.width/40,
									}}>
									<View style={{flexDirection: 'row'}}>
										<View style={{position: 'absolute', right: 0/*windowSize.width/40*/}}>
										<TouchableHighlight
											onPress={() => {
												this.setModalVisible(!this.state.modalVisible);
												//this.setupNotifications(this.state.device);
											}}>
											<Image 
												style={styles.iconWhite}
												source={require('romteknologiapp/images/cancel.png')}
												
												/>
										</TouchableHighlight>
										</View>
										<Text style={styles.textMedium}>Hvordan bruke appen</Text>
												</View>
										<Text style={[styles.textSmall]}>
										Space Bungalow-modellen er ikke i riktig skala, i virkeligheten ville modellen ville vært 50 ganger større og rotert saktere. Det er mulig å velge tyngdeakselerasjon i skala for jorden for å se rotasjonen som den ville vært i verdensrommet. {"\n\n"}

										Velg tyngdeakselerasjon (g) på en av disse metodene: {"\n"}
										- Velg bestemt tyngdeakselerasjon ved å trykke på romstasjonen helt til høyre. {"\n"}
										- Trykk på en planet for å velge planetens tyngdeakselerasjon. For jorden kan akselerasjon for den skalerte modellen velges. {"\n\n"}

										Modellen kan stoppes ved å trykke på "Stopp"-knappen. 
										</Text>
										<Text style={styles.textMedium}></Text>
										<Text style={styles.textMedium}>Space Bungalow og tyngdekraft</Text>
										<Text style={[styles.textSmall]}>
											Tyngdeakselerasjon 
										</Text> 
										<Text style={styles.textMedium}></Text>
										<Text style={styles.textMedium}>Bibliotek og bilder</Text>
										<Text style={[styles.textSmall]}>
											Bluetooth bibliotek: React Native Ble Plx (https://github.com/Polidea/react-native-ble-plx){"\n"}
											Planetbilder: Vector Designed By Neix # from pngtree.com (https://pngtree.com/freepng/planet-planet_1330808.html)
										</Text>
										</View>
									</View>
								</TouchableWithoutFeedback>
							</View>
						
						</ScrollView>
					</TouchableOpacity>   
					
				</Modal>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.alertVisible}>
					<TouchableOpacity 
						style={styles.modalContainer} 
						activeOpacity={1} 
						//onPressOut={() => {this.setAlertVisible(false)}}
						>
						<ScrollView 
							directionalLockEnabled={true} 
							contentContainerStyle={styles.scrollModal}>
						
							<View style={{
								marginTop: windowSize.height*6/16,
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'}}>
								<TouchableWithoutFeedback>
									<View style={{
										backgroundColor: '#000000',
										width: windowSize.width*3/10,
										height: windowSize.height*5/40,
										borderRadius: 18,
										opacity: 0.8,
									}}><View style={{margin: windowSize.width*1/80, justifyContent: 'center',
									alignItems: 'center',flex: 1,
									flexDirection: 'column',
									marginLeft: windowSize.width*1/40}}>
										<Text style={styles.textMedium2}>{this.state.data}</Text>
										</View>
									</View>
								</TouchableWithoutFeedback>
							</View>
						
						</ScrollView>
					</TouchableOpacity>   
				</Modal>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.choiceVisible}>
					<TouchableOpacity 
						style={styles.modalContainer} 
						activeOpacity={1} 
						onPressOut={() => {this.setChoiceVisible(false)}}
						>
						<ScrollView 
							directionalLockEnabled={true} 
							contentContainerStyle={styles.scrollModal}>
						
							<View style={{
								marginTop: windowSize.height*6/16,
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'}}>
								<TouchableWithoutFeedback>
									<View style={{
										backgroundColor: '#000000',
										width: windowSize.width*3/10,
										height: windowSize.height*5/40,
										borderRadius: 18,
										opacity: 0.8,
									}}><View style={{margin: windowSize.width*1/80, justifyContent: 'center',
									alignItems: 'center',flex: 1,
									flexDirection: 'column'}}>
										<Text style={styles.textMedium2}>Skalert? </Text>
										<View style={{justifyContent: 'center',
									alignItems: 'center',flex: 1,
									flexDirection: 'row'}}>
											<View style={{margin: windowSize.width*1/160}}>
											<Button
											onPress={() => {
												this.pressPlanet("-1");
												this.setChoiceVisible(false)
											}}
											title="Ja"
											color="#214682"
											/></View>
											<View style={{margin: windowSize.width*1/160}}>
											<Button
											onPress={() => {
												this.pressPlanet("1");
												this.setChoiceVisible(false)
											}}
											title="Nei"
											color="#214682"
											/>
											</View>
											</View>
										</View>
									</View>
								</TouchableWithoutFeedback>
							</View>
						
						</ScrollView>
					</TouchableOpacity>   
				</Modal>
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.pickerVisible}>
					<TouchableOpacity 
						style={styles.modalContainer} 
						activeOpacity={1} 
						onPressOut={() => {this.setPickerVisible(false)}}>

						<ScrollView 
							directionalLockEnabled={true} 
							contentContainerStyle={styles.scrollModal}>
						
							<View style={{
								marginTop: windowSize.height*1/20, // windowSize.width*1/8,
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'}}>
								<TouchableWithoutFeedback>
									<View style={{
										backgroundColor: '#000000',
										width: windowSize.width*1/2, //4/5
										height: windowSize.height*9/10,
										borderRadius: 18,
										//elevation: 2,
										opacity: 0.9,
										//marginLeft: windowSize.width/20,
										//shadowColor: 'black', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16
									}}>
										<View style={{	margin: windowSize.width * 1/15,  /*justifyContent: 'center',*/
											alignItems: 'center',flex: 1,
											flexDirection: 'row'}}
										>
											<SliderVertical 
												step={0.1}
												maximumValue={4}
												//minimumValue={0}
												//thumbTintColor='blue'
												//style={{thumbTintColor='blue'}}
												thumbTouchSize={{width: 60, height: 60}}
												//thumbImage={require('romteknologiapp/images/earth.png')}
												//thumbStyle={styles.thumb}
												ref="slider"
												value={this.state.chooseValue}
												minimumTrackTintColor='transparent' //'#bababa'
												maximumTrackTintColor='white'
												//maximumTrackTintColor='transparent'  
												//minimumTrackTintColor='transparent'
												style={styles.sliderVertical}
												thumbTintColor='#FFFFFF'
												orientation='vertical'
												onValueChange={(value) => {
													this.setChooseValue(value);
													this.setSendValue((4-value).toFixed(1));
													// husk å tostring før sending
													//console.log(value)
												}}>
											</SliderVertical>
											<View style={{	  /*justifyContent: 'center',*/
											alignItems: 'center',flex: 1
											//right: 0
											}}>
												<View style={{marginRight: windowSize.width * 1/20, marginLeft: windowSize.width * 1/20,
												marginBottom: windowSize.height * 1/30}}>
													<Text style={[styles.number]}>{this.state.sendValue}</Text>

												</View>
												<View style={styles.sliderButton}>
													<Button
															onPress={() => {
																if(!this.state.buttonDisable) {
																	this.sendData(this.state.sendValue);
																	this.setPickerVisible(false);
																}
															}}
															title="Send"
															color="#214682"
															/>
												</View>
											</View>
										</View>	
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
					<Text style={[styles.textSmall/*, {position: 'absolute'}*/]}>
						{(this.state.connect)}
					</Text>
					<View style={{/*flexDirection: 'row', *//*justifyContent: 'flex-end'*/ position: 'absolute', right: windowSize.width/40}}> 
					<TouchableOpacity
						onPress={() => {
							this.setModalVisible(!this.state.modalVisible);
							//this.manager.cancelTransaction(transactionID);
							}}>
						<Image 
							style={styles.iconWhite}
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
							<PlanetView planet="earth" pressPlanet={this.pressEarth} />
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
							<PlanetView planet="spaceStation" pressPlanet={this.pressStation} />
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
					<View style={{/*flexDirection: 'row',*/ alignItems: 'center', justifyContent: 'center', //borderColor: 'black', borderRadius: 4,
    /*borderWidth: 0.5,*/}}>
						<Text style={styles.textLarge}>Tyngdeakselerasjon på romstasjonen: </Text>
						<Text style={styles.textLarge}>
							{(this.state.values[this.characteristicNUUID()] || "0.00") + " g"}
						</Text>
						<ButtonStop
							title="Stopp"
							type="solid"
							buttonStyle={{backgroundColor: "white", marginTop: windowSize.height * 1/50}}
							titleStyle={{color: '#122544'}}
							onPress={() => {
								if(!this.state.buttonDisable) {
									this.sendData('0');
								}
							}}
						/>
					</View>
					
					
				</View>
				
			</View>
			
		);
	}
}

const textNormal = {
	color: '#FFFFFF',
	fontFamily: 'OpenSans-Regular',
};
const textOrbitron = {
	color: '#FFFFFF',
	fontFamily: 'Orbitron-Regular',
};

const iconSize = windowSize.height * 1/22;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#122544',
	},
	container1: {
		flex: 0,
		justifyContent: 'center',
		alignItems: 'center',
		//height: windowSize.width * 8/10,
		marginTop: (windowSize.height/windowSize.width > 1.5) ? windowSize.height * 1/40 : 0,
		height: (windowSize.height/windowSize.width > 1.5) ? windowSize.height * 9/20 : windowSize.height * 6/10,
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
		width: iconSize,
		height: iconSize,
		marginLeft: windowSize.width * 1/80,
	},
	iconWhite: {
		width: iconSize,
		height: iconSize,
		tintColor: '#FFFFFF',
	},
	arrowLeft: {
		position: 'absolute',
		right: windowSize.width * 31/80,
	},
	arrowRight: {
		position: 'absolute',
		left: windowSize.width * 31/80,
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
	textSmall: {
		...textNormal,
		fontSize: (windowSize.height/windowSize.width > 1.5) ? windowSize.width * 1/30 : windowSize.width * 1/40,
	},
	textMedium: {
		...textOrbitron,
		//fontSize: windowSize.width * 1/30,
		fontSize: (windowSize.height/windowSize.width > 1.5) ? windowSize.width * 1/20 : windowSize.width * 1/30,
		marginBottom: windowSize.width * 1/150,
	},

	textMedium2: {
		...textNormal,
		//fontSize: windowSize.width * 1/30,
		fontSize: (windowSize.height/windowSize.width > 1.5) ? windowSize.width * 1/20 : windowSize.width * 1/30,
	},
	textLarge: {
		...textNormal,
		fontSize: windowSize.width * 1/20,
	},
	title: {
		...textOrbitron,
		fontSize: windowSize.width * 1/14,
		marginBottom: windowSize.height * 1/60,
		marginTop: windowSize.height * 1/120,
	},
	number: {
		...textOrbitron,
		fontSize: windowSize.width * 1/14,
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
	sliderVertical: {
		//color: '#6addaf'
		height: windowSize.height * 7/10,
		
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
