import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import mapboxgl from 'mapbox-gl';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        joy: [
        {
          "name": "California",
          "score": Math.random()
        }
        ],
        sadness: [
        {
          "name": "California",
          "score": Math.random()
        }
        ]
      },
      currentEmotion: 'joy'
    };
    this.handleToneSelection = this.handleToneSelection.bind(this);
  }

  componentDidMount() {
    var currentEmotionData = this.state.data[this.state.currentEmotion];
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw';
    var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-95.38, 39], // starting position
      zoom: 4 // starting zoom
    });

    map.on('load', function () {
      map.addSource("states", {
        "type": "geojson",
        "data": "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces.geojson"
      });

      for (var i = 0; i < currentEmotionData.length; i++) {
        var color = that.colorCode(currentEmotionData[i].score);
        map.addLayer({
          "id": currentEmotionData[i].name + "-fill",
          "type": "fill",
          "source": "states",
          "layout": {},
          "paint": {
            "fill-color": color,
            "fill-opacity": 0.3
          },
          "filter": ["==", "name", currentEmotionData[i].name]
        });
      }
    });


  }


  // TODO: News get request


  // when user selects tone
  handleToneSelection(tone) {
    $.ajax({
      type: 'GET',
      url: '/tones/' + tone + '/emotion',
      data: {tone: tone}, // from news
      success: (data) => {},
      error: (err) => { console.log('Watson: Failed to get tone data from server ', err); }
    });
  }


  render() {
    return (
      <div>
        <p className='title'>News Mapper</p>
        <div className='col-md-1'>
          <select className='form-control selector'>
            <option>Joy</option>
            <option>Anger</option>
            <option>Disgust</option>
            <option>Fear</option>
            <option>Sadness</option>
          </select>
        </div>
        <List />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
