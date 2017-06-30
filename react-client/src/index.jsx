import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import mapboxgl from 'mapbox-gl';
var dictionary = require('../../database-mongo/dictionary.js').dictionary;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          state: 'CA',
          tones: {
            joy: Math.random() * 100,
            anger: Math.random() * 100,
            disgust: Math.random() * 100,
            fear: Math.random() * 100,
            sadness: Math.random() * 100
          }
        },
        {
          state: 'NV',
          tones: {
            joy: null,
            anger: null,
            disgust: null,
            fear: null,
            sadness: null
          }
        },
        {
          state: 'AZ',
          tones: {
            joy: Math.random() * 100,
            anger: Math.random() * 100,
            disgust: Math.random() * 100,
            fear: Math.random() * 100,
            sadness: Math.random() * 100
          }
        }
      ],
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
    var data = this.state.data;
    var currentEmotion = this.state.currentEmotion;
    var that = this;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw';
    var map = new mapboxgl.Map({
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

      that.refreshMap(map, data, currentEmotion);
    });

    this.setState({
      map: map
    });
  }

  refreshMap(map, data, currentEmotion) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].tones[currentEmotion] !== null) {
        var color = this.getColor(data[i].tones[currentEmotion], currentEmotion);
        map.addLayer({
          'id': data[i].state + '-fill',
          'type': 'fill',
          'source': 'states',
          'layout': {},
          'paint': {
            'fill-color': color,
            'fill-opacity': 0.3
          },
          'filter': ['==', 'name', dictionary[data[i].state]]
        });
      }
    }
  }


  // TODO: News get request


  // when user selects tone
  handleToneSelection(event) {
    var newSelection = event.target.value[0].toLowerCase() + event.target.value.slice(1);

    this.setState({
      currentEmotion: newSelection
    });

    this.refreshMap(this.state.map, this.state.data, newSelection);


    // $.ajax({
    //   type: 'GET',
    //   url: '/tones/' + tone + '/emotion',
    //   data: {tone: tone}, // from news
    //   success: (data) => {},
    //   error: (err) => { console.log('Watson: Failed to get tone data from server ', err); }
    // });
  }


  render() {
    return (
      <div>
        <p className='title'>News Mapper</p>
        <div className='col-md-2'>
          <select className='form-control selector' onChange={this.handleToneSelection} value={this.state.currentEmotion[0].toUpperCase() + this.state.currentEmotion.slice(1)}>
            <option>Joy</option>
            <option>Anger</option>
            <option>Disgust</option>
            <option>Fear</option>
            <option>Sadness</option>
          </select>
        </div>
        <div className='col-md-9'></div>
        <div className='col-md-1'>
          <List colorCode={this.state.colors[this.state.currentEmotion]}/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
