import React, { Component } from 'react';

class Maps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      places: props.places
    };
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      places: props.places
    });
    window.initMap = this.initMap;
    this.loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyChMaHhqI42AeeqrFsWv0PTpA_YRu8P0CI&callback=initMap');
  }

  initMap = () => {
    const center = this.state.places[0]; // NOTE: eventually do fancy calculations here
    const map = new window.google.maps.Map(this.refs.map, {zoom: 5, center: {lat: center.lat, lng: center.lng}});
    this.state.places.forEach(({lat, lng}) => {
      new window.google.maps.Marker({
        position: {lat, lng},
        map: map
      });
    });
  }

  loadJS = (src) => {
    const ref = window.document.getElementsByTagName('script')[0];
    const script = window.document.createElement('script');
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore(script, ref);
  }

  render = () => {
    return (
      <div ref='map' className='map'></div>
    )
  }

}

export default Maps;
