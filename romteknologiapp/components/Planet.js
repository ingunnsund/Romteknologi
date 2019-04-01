import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
  } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';

const windowSize = Dimensions.get('window');
let tall = 0;

const planets = { // https://pngtree.com/freepng/planet-planet_1330808.html
    sun: {
        name: 'Solen',
        url: require('romteknologiapp/images/sun.png'),
        text: 'På Solen er det 28 g',
        gravity: 28,
    }, 
    mercury: {
        name: 'Merkur',
        url: require('romteknologiapp/images/mercury.png'),
        text: 'På Merkur er det 0.38 g',
        gravity: 0.38,
    }, 
    venus: {
        name: 'Venus',
        url: require('romteknologiapp/images/venus.png'),
        text: 'På Venus er det 0.9 g',
        gravity: 0.9,
    },
    moon: {
        name: 'Månen',
        url: require('romteknologiapp/images/moon.png'),
        text: 'På Månen er det 0.17 g',
        gravity: 0.17,
    },
    earth: {
        name: 'Jorden',
        url: require('romteknologiapp/images/earth.png'),
        text: 'På Jorden er det 1 g',
        gravity: 1,
    },
    mars: {
        name: 'Mars', 
        url: require('romteknologiapp/images/mars.png'),
        text: 'På Mars er det 0.38 g',
        gravity: 0.38,
    },
    jupiter: {
        name: 'Jupiter',
        url: require('romteknologiapp/images/jupiter.png'),
        text: 'På Jupiter er det 2.53 g',
        gravity: 2.53,
    },
    saturn: {
        name: 'Saturn',
        url: require('romteknologiapp/images/saturn.png'),
        text: 'På Saturn er det 1.07 g',
        gravity: 1.07,
    },
    uranus: {
        name: 'Uranus',
        url: require('romteknologiapp/images/uranus.png'),
        text: 'På Uranus er det 0.89 g',
        gravity: 0.89,
    },
    neptune: {
        name: 'Neptun',
        url: require('romteknologiapp/images/neptune.png'),
        text: 'På Neptun er det 1.14 g',
        gravity: 1.14,
    },
    pluto: {
        name: 'Pluto',
        url: require('romteknologiapp/images/pluto.png'),
        text: 'På Pluto er det 0.06 g',
        gravity: 0.06,
    },
    spaceStation: {
        name: 'Velg gravitasjon',
        url: require('romteknologiapp/images/romstasjon.png'),
        text: '',
        gravity: -1,
    }
};



export default class PlanetView extends Component {
	constructor(props) {
        super(props);
        this.state = {
            opacity: 1, 
        }

	}

	render() {
		const {name, url, text, gravity} = planets[this.props.planet];
		let planetStyle = styles.planets;
		if(this.props.planet === 'sun') {
			planetStyle = styles.planetSun;
		} else if(this.props.planet === 'saturn') {
			planetStyle = styles.planetSaturn;
		} 

		return (
			<View style={styles.planetView}>
				<Text style={styles.planetText}>{name}</Text>
                <RadialGradient 
                    colors={['#86a8df', '#122544']}
                    //stops={[0.1,0.4,0.3,0.75]}
                    //center={[Dimensions.get('window').width / 3 , Dimensions.get('window').width / 2]}
                    radius={windowSize.width * 3/10}>
                    <View style={styles.planetContainer}>
                        <TouchableWithoutFeedback 
                            //activeOpacity={0.5}
                            //onLongPress={() => console.log("Testttt")}
                            delayPressIn ={50}
                            delayPressOut={50}
                            onPressIn={() => {
                                //console.log("testtt");
                                this.setState({opacity: 0.5});

                            }}
                            onPress={() => {
                                tall++;
                                this.props.pressPlanet(gravity);
                            }}
                            onPressOut={() => {
                                //console.log("out")
                                this.setState({opacity: 1});
                            }}
                            >

                            <Image
                                style={[planetStyle, {opacity: this.state.opacity}]}
                                source={url} 
                            />
                        </TouchableWithoutFeedback>
                    </View>
				
                </RadialGradient>
                <Text style={styles.infoText}>{text}</Text>
			</View>												
		);
	}
}

const styles = StyleSheet.create({
    planetContainer: {
        width: windowSize.width * 6/10,
        height: windowSize.width * 6/10, 
        justifyContent: 'center',
    	alignItems: 'center',
    },
    planetText: {
		textAlign: 'center',
		fontSize: windowSize.width * 1/20,
		color: '#FFFFFF',
        marginBottom: windowSize.width * 1/40,
        fontFamily: 'Orbitron-Regular',
    },
    infoText: {
		textAlign: 'center',
		fontSize: windowSize.width * 1/30, 
		color: '#FFFFFF',
        marginBottom: 5,
        marginTop: windowSize.width * 1/40,
        fontFamily: 'OpenSans-Regular',
	},
	planets: {
		width: windowSize.width * 2/5,
		height: windowSize.width * 2/5, 
	},
	planetSaturn: {
		width: windowSize.width * 3/5,
		height: windowSize.width * 3/5, 
	},
	planetSun: {
		width: windowSize.width * 5/10,
		height: windowSize.width * 5/10, 
    },
    planetView: {
		width: windowSize.width,
		justifyContent: 'center',
    	alignItems: 'center',
    },
});
