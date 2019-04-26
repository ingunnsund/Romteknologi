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

let off = 1;

const windowSize = Dimensions.get('window');


export default class Arrow extends React.Component {
    

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
            //<Animated.View                 // Special animatable View
            <View
			style={{/*...styles.arrow, */ /*opacity: fadeAnim,*/ position: 'absolute', height: windowSize.width * 1/10 }}
			>
            {this.props.children}
            </View>           
			//</Animated.View>
		);
	}
}