import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Legend from './components/Legend.jsx';
import Dropdown from './components/Dropdown.jsx';
import mapboxgl from 'mapbox-gl';
import { countryDict } from '../../reference/dictionary.js';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stateData: [],
      countryData: [],
      currentEmotion: 'joy',
      map: null,
      colors: {
        //purple
        joy: ['hsl(300, 100%, 0%)', 'hsl(300, 100%, 25%)', 'hsl(300, 100%, 50%)', 'hsl(300, 100%, 75%)', 'hsl(300, 100%, 100%)'],
        //yellow
        anger: ['hsl(60, 100%, 10%)', 'hsl(60, 100%, 25%)', 'hsl(60, 100%, 50%)', 'hsl(60, 100%, 75%)', 'hsl(60, 100%, 100%)'],
        //blue
        disgust: ['hsl(250, 100%, 10%)', 'hsl(250, 100%, 25%)', 'hsl(250, 100%, 50%)', 'hsl(250, 100%, 75%)', 'hsl(250, 100%, 90%)'],
        //green
        fear: ['hsl(120, 100%, 10%)', 'hsl(120, 100%, 25%)', 'hsl(120, 100%, 50%)', 'hsl(120, 100%, 75%)', 'hsl(120, 100%, 90%)'],
        //red
        sadness: ['hsl(0, 50%, 10%)', 'hsl(0, 50%, 25%)', 'hsl(0, 50%, 50%)', 'hsl(0, 50%, 75%)', 'hsl(0, 50%, 90%)']
      }
    };

    this.handleToneSelection = this.handleToneSelection.bind(this);
  }


  getColor(score, currentEmotion) {
    if (currentEmotion === 'joy') {
      return 'hsl(300, 100%, ' + score + '%)';
    } else if (currentEmotion === 'anger') {
      return 'hsl(60, 100%, ' + (score * 0.9 + 10) + '%)';
    } else if (currentEmotion === 'disgust') {
      return 'hsl(250, 100%, ' + (score * 0.8 + 10) + '%)';
    } else if (currentEmotion === 'fear') {
      return 'hsl(120, 100%, ' + (score * 0.8 + 10) + '%)';
    } else {
      return 'hsl(0, 50%, ' + (score * 0.8 + 10) + '%)';
    }
  }


  componentDidMount() {
    const data = this.state.data;
    const currentEmotion = this.state.currentEmotion;
    const that = this;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw';
    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-95.38, 39], // starting position
      zoom: 4 // starting zoom
    });

    map.on('load', function () {
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
      $.ajax({
        type: 'GET',
        url: '/tones?scope=country',
        success: (data) => {
          const countryData = data;
          that.setState({
            countryData: countryData
          });

          that.refreshMap(map, countryData, currentEmotion);
        },
        error: (err) => { console.log('Failed to get data from server ', err); }
      });


    });

    // allows the map to be accessed throughout the app
    this.setState({
      map: map
    });
  }


  // adds a layer representing data on the currently selected tone
  refreshMap(map, countryData, currentEmotion) {
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
        map.addLayer({
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


  // when user selects tone
  handleToneSelection(event) {
    const newlySelectedEmotion = event.target.value[0].toLowerCase() + event.target.value.slice(1);

    this.setState({
      currentEmotion: newlySelectedEmotion
    });

    this.refreshMap(this.state.map, this.state.data, newlySelectedEmotion);
  }


  render() {
    return (
      <div>
        <p className='title'>News Mapper</p>
        <Dropdown handleToneSelection={this.handleToneSelection} currentEmotion={this.state.currentEmotion}/>
        <div className='col-md-9 col-sm-9 col-lg-9'></div>
        <div className='col-md-1 col-sm-1 col-lg-1'>
          <Legend color={this.state.colors[this.state.currentEmotion]} emotion={this.state.currentEmotion}/>
        </div>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('app'));
