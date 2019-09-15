import React, { Component } from 'react';

class Maps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      places: props.places
    };
  }

  getZoom = (latDiff, lngDiff) => {
    switch (true) { // NOTE: eventually handle also lngDiff
      case (latDiff === 0): return 9;
      case (latDiff < 1): return 8;
      case (latDiff < 5): return 6;
      case (latDiff < 10): return 5;
      case (latDiff < 15): return 4;
      case (latDiff < 20): return 3;
      default: return 2;
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.places !== this.props.places) {
      this.setState({places: this.props.places});
      const places = this.props.places;
      if (places.length) {
        const latList = places.map(p => p.lat);
        const lngList = places.map(p => p.lng);
        const latDiff = Math.abs(Math.max.apply(null, latList) - Math.min.apply(null, latList));
        const lngDiff = Math.abs(Math.max.apply(null, lngList) - Math.min.apply(null, lngList));
        const zoom = this.getZoom(latDiff, lngDiff);
        const centerLat = (Math.max.apply(null, latList) + Math.min.apply(null, latList)) / 2;
        const centerLng = (Math.max.apply(null, lngList) + Math.min.apply(null, lngList)) / 2;
        const map = new window.google.maps.Map(this.refs.map, {zoom, center: {lat: centerLat, lng: centerLng}});
        places.forEach(({lat, lng}) => {
          new window.google.maps.Marker({
            position: {lat, lng},
            map: map
          });
        });
      }
    }
  }

  render = () => {
    const className = this.state.places.length ? 'map' : 'no-map';
    return (
      <div ref='map' className={className}></div>
    )
  }

}

export default Maps;
