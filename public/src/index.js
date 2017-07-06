import React from 'react';
import ReactDOM from 'react-dom';

import Legend from './components/Legend';
import EmotionDropdown from './components/EmotionDropdown';
import NewsList from './components/NewsList'; 

import mapboxgl from 'mapbox-gl';

import dictionary from './data/dictionary';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      currentEmotion: 'joy',
      selectedState: 'California',
      modalVisible: false,
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

    this.setState({
      map
    });


    map.on('load', () => {
      map.addSource('states', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces.geojson'
      });

      map.addLayer({
        'id': 'states-layer',
        'type': 'fill',
        'source': 'states'
      })

      // get data on tones once map loads
      fetch('/tones')
        .then( res => res.json() )
        .then( data => {
          this.setState(
            data: data
          );
          this.refreshMap(data, currentEmotion);
        })
        .catch( err => {
          console.log('Failed to get data from server ', err);
        });
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['states-layer']});
      if (!features.length) {
        return;
      } else {
        const feature = features[0]; 
        this.setState({
          selectedState: feature.properties.name,
          modalVisible: true
        });
        console.log(this.state);
      }
    });

  };

  // adds a layer representing data on the currently selected tone
  refreshMap(data, currentEmotion) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].tones[currentEmotion] !== null) {
        let color = this.getColor(data[i].tones[currentEmotion], currentEmotion);
        this.state.map.addLayer({
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

  hideModal() {
    this.setState({
      modalVisible: false
    })
  }

  handleToneSelection(event) {
    const newlySelectedEmotion = event.target.value[0].toLowerCase() + event.target.value.slice(1);

    this.setState({
      currentEmotion: newlySelectedEmotion
    });

    this.refreshMap(this.state.data, newlySelectedEmotion);
  }

  render() {

    const appStyle = {
      position: `absolute`,
      zIndex: `1`,
      pointerEvents: `none`,
      top: `0`,
      left: `0`,
      width: `100vw`,
      height: `100vh`,
      overflow: `hidden`,
    };

    const titleStyle = {
      color: `white`,
      backgroundColor: '#aaaaaa',
      opacity: `0.5`,
      fontSize: `2em`,
      paddingLeft: `2em`,
    };

    return (
      <div style={appStyle}>
        <p style={titleStyle}>News Mapper</p>
        <EmotionDropdown handleEmotionChange={this.handleToneSelection.bind(this)} options={Object.keys(this.state.colors)} value={this.state.currentEmotion}/>
        <Legend color={this.state.colors[this.state.currentEmotion]} emotion={this.state.currentEmotion}/>
        {
          ( () => this.state.modalVisible 
            ? (
            <NewsList
              state={this.state.selectedState}
              onCloseClick={this.hideModal.bind(this)}
              articles={[
                {title: 'Suh', source: 'http://www.google.com'},
                {title: 'Suh', source: 'http://www.google.com'},
                {title: 'Suh', source: 'http://www.google.com'},
                {title: 'Suh', source: 'http://www.google.com'},
                {title: 'Suh', source: 'http://www.google.com'},
              ]}/>
            )
            : '')()
        }
      </div>
    );
    
  }

};


ReactDOM.render(<App />, document.getElementById('app'));
