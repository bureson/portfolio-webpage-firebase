import React, { Component } from 'react';

class Maps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      places: props.places
    };
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.places !== this.props.places) {
      this.setState({places: this.props.places});
      const places = this.props.places;
      if (places.length) {
        const map = new window.google.maps.Map(this.refs.map, {controlSize: 24});
        const bounds = new window.google.maps.LatLngBounds();
        places.forEach(({lat, lng}) => {
          bounds.extend({lat, lng});
          new window.google.maps.Marker({
            position: {lat, lng},
            map: map
          });
        });
        if (places.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(11);
        } else {
          // Note: fitBounds derives the zoom from both axes and the actual
          // container size, the padding is tuned for the compact card map
          map.fitBounds(bounds, 24);
          // Note: when the pins sit close together fitBounds would dive to
          // street level, cap the initial zoom at city scale
          const listener = map.addListener('idle', () => {
            if (map.getZoom() > 12) map.setZoom(12);
            window.google.maps.event.removeListener(listener);
          });
        }
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
