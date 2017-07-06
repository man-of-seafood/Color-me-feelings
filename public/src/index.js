import React from 'react';
import ReactDOM from 'react-dom';

import Legend from './components/Legend';
import EmotionDropdown from './components/EmotionDropdown';

import mapboxgl from 'mapbox-gl';
import { stateDict, countryDict } from '../../reference/dictionary.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stateData: [],
      countryData: [],
      currentEmotion: 'joy',
      map: null,
      colors: {
        joy: ['hsl(300, 100%, 0%)', 'hsl(300, 100%, 25%)', 'hsl(300, 100%, 50%)', 'hsl(300, 100%, 75%)', 'hsl(300, 100%, 100%)'],
        anger: ['hsl(60, 100%, 10%)', 'hsl(60, 100%, 25%)', 'hsl(60, 100%, 50%)', 'hsl(60, 100%, 75%)', 'hsl(60, 100%, 100%)'],
        disgust: ['hsl(250, 100%, 10%)', 'hsl(250, 100%, 25%)', 'hsl(250, 100%, 50%)', 'hsl(250, 100%, 75%)', 'hsl(250, 100%, 90%)'],
        fear: ['hsl(120, 100%, 10%)', 'hsl(120, 100%, 25%)', 'hsl(120, 100%, 50%)', 'hsl(120, 100%, 75%)', 'hsl(120, 100%, 90%)'],
        sadness: ['hsl(0, 50%, 10%)', 'hsl(0, 50%, 25%)', 'hsl(0, 50%, 50%)', 'hsl(0, 50%, 75%)', 'hsl(0, 50%, 90%)']
      }
    };

  }


  getColor(score, currentEmotion) {
    const hues = {
      joy: 300,
      anger: 60,
      disgust: 250,
      fear: 120,
      default: 0,
    };
    return `hsl(${hues[currentEmotion]}, 100%, ${score}%)`;
  }


  componentDidMount() {
    const data = this.state.data;
    const currentEmotion = this.state.currentEmotion;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw';

    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-95.38, 39], // starting position
      zoom: 4 // starting zoom
    });

    this.setState({ map });

    map.on('load', () => {
      /*~~~ STATE ~~~*/
      map.addSource('states', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces.geojson'
      });

      /*~~~ COUNTRY ~~~*/
      map.addSource('countries', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
      });

      // get data on tones once map loads
      fetch('/tones?scope=country')
        .then( res => res.json() )
        .then( data => {
          const countryData = data;
          this.setState(
            countryData: countryData
          );
          this.refreshMap(countryData, currentEmotion);
        })
        .catch( err => {
          console.log('Failed to get data from server ', err);
        });
    });


  };

  // adds a layer representing data on the currently selected tone
  refreshMap(countryData, currentEmotion) {
    /*~~~ STATE ~~~*/
    // for (let i = 0; i < stateData.length; i++) {
    //   if (stateData[i].tones[currentEmotion] !== null) {
    //     let color = this.getColor(stateData[i].tones[currentEmotion], currentEmotion);
    //     map.addLayer({
    //       'id': stateData[i].state + '-fill',
    //       'type': 'fill',
    //       'source': 'states',
    //       'layout': {},
    //       'paint': {
    //         'fill-color': color,
    //         'fill-opacity': 0.3
    //       },
    //       'filter': ['==', 'name', dictionary[stateData[i].state]]
    //     });
    //   }
    // }

    /*~~~ COUNTRY ~~~*/
    for (let i = 0; i < countryData.length; i++) {
      console.log(countryData[i].country)
      if (countryData[i].tones[currentEmotion] !== null) {
        let color = this.getColor(countryData[i].tones[currentEmotion], currentEmotion);
        this.state.map.addLayer({
          'id': countryData[i].country + '-fill',
          'type': 'fill',
          'source': 'countries',
          'layout': {},
          'paint': {
            'fill-color': color,
            'fill-opacity': 0.3
          },
          'filter': ['==', 'name', countryDict[countryData[i].country]]
        });
      }
    }
  }


  handleToneSelection(event) {
    const newlySelectedEmotion = event.target.value[0].toLowerCase() + event.target.value.slice(1);

    this.setState({
      currentEmotion: newlySelectedEmotion
    });

    this.refreshMap(this.state.data, newlySelectedEmotion);
  }

  render() {
    return (
      <div>
        <p className='title'>News Mapper</p>
        <EmotionDropdown handleEmotionChange={this.handleToneSelection.bind(this)} options={Object.keys(this.state.colors)} value={this.state.currentEmotion}/>
        <div className='col-md-9 col-sm-9 col-lg-9'></div>
        <div className='col-md-1 col-sm-1 col-lg-1'>
          <Legend color={this.state.colors[this.state.currentEmotion]} emotion={this.state.currentEmotion}/>
        </div>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('app'));
