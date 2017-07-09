import React from 'react';
import ReactDOM from 'react-dom';
import { Header } from 'semantic-ui-react';

import Legend from './components/Legend';
import EmotionPrompt from './components/EmotionPrompt';
import TopicPrompt from './components/TopicPrompt';
import PeriodPrompt from './components/PeriodPrompt';
import NewsList from './components/NewsList'; 

import topicsObj from '../../reference/topics.js'; 
//const topics = ['Donald Trump', 'immigration', 'war', 'coffee', 'obesity', 'education', 'marijuana', 'refugees', 'capitalism', 'global warming'];

import './app.css';

import mapboxgl from 'mapbox-gl';
import { stateDict, countryDict } from '../../reference/dictionary.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stateData: [],
      countryData: [],
      currentEmotion: 'joy',
      currentTopic: 'war',
      currentPeriod: 'month',
      selectedState: 'California',
      modalOpen: false,
      map: null,
      colors: {
        joy: ['hsl(300, 100%, 0%)', 'hsl(300, 100%, 25%)', 'hsl(300, 100%, 50%)', 'hsl(300, 100%, 75%)', 'hsl(300, 100%, 100%)'],
        anger: ['hsl(60, 100%, 10%)', 'hsl(60, 100%, 25%)', 'hsl(60, 100%, 50%)', 'hsl(60, 100%, 75%)', 'hsl(60, 100%, 100%)'],
        disgust: ['hsl(250, 100%, 10%)', 'hsl(250, 100%, 25%)', 'hsl(250, 100%, 50%)', 'hsl(250, 100%, 75%)', 'hsl(250, 100%, 90%)'],
        fear: ['hsl(120, 100%, 10%)', 'hsl(120, 100%, 25%)', 'hsl(120, 100%, 50%)', 'hsl(120, 100%, 75%)', 'hsl(120, 100%, 90%)'],
        sadness: ['hsl(180, 50%, 10%)', 'hsl(180, 50%, 25%)', 'hsl(180, 50%, 50%)', 'hsl(180, 50%, 75%)', 'hsl(180, 50%, 90%)']
      },
      articles: []
    };

    this.emotionMap = {
      joyful: 'joy',
      angry: 'anger',
      disgusted: 'disgust',
      fearful: 'fear',
      sad: 'sadness',
      joy: 'joyful',
      anger: 'angry',
      disgust: 'disgusted',
      fear: 'fearful',
      sadness: 'sad'
    };
  }

  getColor(score, currentEmotion) {
    const hues = {
      joy: 300,
      anger: 60,
      disgust: 250,
      fear: 120,
      sadness: 180,
    };
    return `hsl(${hues[currentEmotion]}, 100%, ${score * 100}%)`;
  }


  componentDidMount() {
    const data = this.state.data;
    const currentEmotion = this.state.currentEmotion;
    const currentTopic = this.state.currentTopic;
    const currentPeriod = this.state.currentPeriod;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw';

    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-95.38, 39], // starting position
      zoom: 2 // starting zoom
    });

    this.setState({ map });

    map.on('load', () => {

      /*~~~ COUNTRY ~~~*/
      map.addSource('country', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
      });

      map.addLayer({
        'id': 'country-layer',
        'type': 'fill',
        'paint': {
          'fill-opacity': 0
        },
        'source': 'country'
      });

      /*~~~ STATE ~~~*/
      map.addSource('state', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces.geojson'
      });

      map.addLayer({
        'id': 'states-layer',
        'type': 'fill',
        'paint': {
          'fill-opacity': 0
        },
        'source': 'state'
      });

      let countryData = [];
      let stateData = [];
      // get data on tones once map loads
      fetch('/tones?scope=country')
        .then( res => res.json() )
        .then( data => {
          countryData = data; 
        })
        .catch( err => {
          console.log('Failed to get country data from server ', err);
        })
        .then(
          fetch('/tones?scope=state')
            .then( res => res.json() )
            .then( data => {
              stateData = data;
              this.setState({
                countryData,
                stateData
              });
              this.refreshMap([[stateData, 'state'], [countryData, 'country']], currentEmotion, currentTopic, currentPeriod);

            })
            .catch( err => {
              console.log('Failed to get state data from server ', err);
            })
        );
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['country-layer', 'states-layer']});
      if (!features.length) {
        return;
      } else {
        const feature = features[0]; 
        if (feature.properties.iso_a2 === 'US') {
          this.setState({
            selectedState: feature.properties.name,
            articles: this.state.stateData.filter( data => {
              return data.state === feature.properties.postal;
            }).concat({ articles: [] })[0].articles,
            modalOpen: true
          });
        } else {
          this.setState({
            selectedState: feature.properties.name,
            articles: this.state.countryData.filter( data => {
              return data.country === feature.properties.postal;
            }).concat({ articles: [] })[0].articles,
            modalOpen: true
          });
        }
      }
    });
  }

  // adds a layer representing data on the currently selected tone
  refreshMap(dataArr, currentEmotion, currentTopic, currentPeriod) {
    //filter all country and state data by topic
    let filteredArr = [['data', 'state'], ['data', 'country']];
    dataArr.forEach((scopeData, idx) => {
      const tempArr = [];
      scopeData[0].forEach(data => {
        if (data.topic === currentTopic && data.period === currentPeriod) {
          tempArr.push(data);
        }
      });
      filteredArr[idx][0] = tempArr; 
    });

    /*~~~ COUNTRY AND STATE ~~~*/
    filteredArr.forEach(scopeData => {
      //scopeData[0] is data set, scopeData[1] is data scope
      const type = scopeData[1];
      const data = scopeData[0];
      const dict = type === 'state' ? stateDict : countryDict;
      for (let i = 0; i < data.length; i++) {
        if (data[i].toneAverages[currentEmotion] !== null) {
          const opacity = data[i].toneAverages[currentEmotion] === 0 ? 0 : 0.3; //no fill if no articles found for that topic
          const color = this.getColor(data[i].toneAverages[currentEmotion], currentEmotion);
          this.state.map.addLayer({
            'id': data[i][type] + type + '-fill',
            'type': 'fill',
            'source': type,
            'layout': {},
            'paint': {
              'fill-color': color,
              'fill-opacity': opacity
            },
            'filter': ['==', 'name', dict[data[i][type]]]
          });
        }
      }
    });
  }

  hideModal() {
    this.setState({
      modalOpen: false
    });
  }

  handleToneSelection(event, data) {
    const newlySelectedEmotion = this.emotionMap[data.value];

    this.setState({
      currentEmotion: newlySelectedEmotion
    });

    this.refreshMap([[this.state.stateData, 'state'], [this.state.countryData, 'country']], newlySelectedEmotion, this.state.currentTopic, this.state.currentPeriod);
  }

  handleTopicSelection(event, data) {
    const newlySelectedTopic = data.value;

    this.setState({
      currentTopic: newlySelectedTopic
    });

    this.refreshMap([[this.state.stateData, 'state'], [this.state.countryData, 'country']], this.state.currentEmotion, newlySelectedTopic, this.state.currentPeriod);
  }

  handlePeriodSelection(event, data) {
    const newlySelectedPeriod = data.value;

    this.setState({
      currentPeriod: newlySelectedPeriod
    });

    this.refreshMap([[this.state.stateData, 'state'], [this.state.countryData, 'country']], this.state.currentEmotion, this.state.currentTopic, newlySelectedPeriod);
  }

  render() {

    return (
      <div className="app-root">
        <Header inverted className="title">News Mapper</Header>
        <PeriodPrompt 
          handlePeriodChange={this.handlePeriodSelection.bind(this)} 
          periods={['month', 'week', 'day']}
          period={this.state.currentPeriod}
        />
        <EmotionPrompt 
          handleToneChange={this.handleToneSelection.bind(this)} 
          emotions={['joyful', 'angry', 'disgusted', 'fearful', 'sad']} 
          emotion={this.emotionMap[this.state.currentEmotion]}
        />
        <TopicPrompt
          handleTopicChange={this.handleTopicSelection.bind(this)}
          topics={topicsObj}
          topic={this.state.currentTopic}/>
        <Legend color={this.state.colors[this.state.currentEmotion]} emotion={this.state.currentEmotion}/>
        <NewsList
          state={this.state.selectedState}
          open={this.state.modalOpen}
          onCloseClick={this.hideModal.bind(this)}
          articles={this.state.articles}
        />
      </div>
    );
    
  }
}


ReactDOM.render(<App />, document.getElementById('app'));
