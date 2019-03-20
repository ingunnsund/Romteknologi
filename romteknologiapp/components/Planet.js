import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
  } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';

const windowSize = Dimensions.get('window');

const planets = {
    sun: {
        name: 'Solen',
        url: require('romteknologiapp/images/sun.png'),
    }, 
    mercury: {
        name: 'Merkur',
        url: require('romteknologiapp/images/mercury.png'),
    }, 
    venus: {
        name: 'Venus',
        url: require('romteknologiapp/images/venus.png'),
    },
    moon: {
        name: 'Månen',
        url: require('romteknologiapp/images/moon.png'),
    },
    earth: {
        name: 'Jorden',
        url: require('romteknologiapp/images/earth.png'),
    },
    mars: {
        name: 'Mars', 
        url: require('romteknologiapp/images/mars.png'),
    },
    jupiter: {
        name: 'Jupiter',
        url: require('romteknologiapp/images/jupiter.png'),
    },
    saturn: {
        name: 'Saturn',
        url: require('romteknologiapp/images/saturn.png'),
    },
    uranus: {
        name: 'Uranus',
        url: require('romteknologiapp/images/uranus.png'),
    },
    neptune: {
        name: 'Neptun',
        url: require('romteknologiapp/images/neptune.png'),
    },
    pluto: {
        name: 'Pluto',
        url: require('romteknologiapp/images/pluto.png'),
    },
};



export default class PlanetView extends Component {
	constructor(props) {
		super(props)

	}

	render() {
		const {name, url} = planets[this.props.planet];
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
                        <TouchableOpacity 
                            activeOpacity={0.5}
                            onLongPress={() => console.log("Testttt")}>
                            <Image
                                style={planetStyle}
                                source={url} 
                            />
                        </TouchableOpacity>
                    </View>
				
                </RadialGradient>
                <Text style={styles.infoText}>Planet text</Text>
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
        marginBottom: 5,
        fontFamily: 'Orbitron-Regular',
    },
    infoText: {
		textAlign: 'center',
		fontSize: windowSize.width * 1/40,
		color: '#FFFFFF',
        marginBottom: 5,
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
