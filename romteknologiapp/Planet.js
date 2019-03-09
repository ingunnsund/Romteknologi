import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
  } from 'react-native';

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
				<Image
					style={planetStyle}
					source={url} 
				/>
			</View>												
		);
	}
}

const styles = StyleSheet.create({
    planetText: {
		textAlign: 'center',
		fontSize: Dimensions.get('window').width * 1/20,
		color: '#FFFFFF',
		marginBottom: 5,
	},
	planets: {
		width: Dimensions.get('window').width * 2/5,
		height: Dimensions.get('window').width * 2/5, 
	},
	planetSaturn: {
		width: Dimensions.get('window').width * 3/5,
		height: Dimensions.get('window').width * 3/5, 
	},
	planetSun: {
		width: Dimensions.get('window').width * 5/10,
		height: Dimensions.get('window').width * 5/10, 
    },
    planetView: {
		width: Dimensions.get('window').width,
		justifyContent: 'center',
    	alignItems: 'center',
    },
});
