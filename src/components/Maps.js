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
        // Note: reuse a single Map instance — Google Maps objects are never
        // garbage collected, so recreating one per update leaks the old map
        if (!this.map) {
          this.map = new window.google.maps.Map(this.refs.map, {
            controlSize: 24,
            mapTypeControl: false,
            streetViewControl: false
          });
        }
        const map = this.map;
        // classic teardrop pin; an SVG data URI because the
        // Symbol renderer draws multi-subpath icons on an opaque tile
        const pinSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">'
          + '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"'
          + ' fill="#ea4335" stroke="#7f201a" stroke-width="1"/></svg>';
        const icon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + window.encodeURIComponent(pinSvg),
          scaledSize: new window.google.maps.Size(36, 36),
          // the pin tip in the 24-unit viewBox is (12, 22) → (18, 33) at 36px
          anchor: new window.google.maps.Point(18, 33)
        };
        const bounds = new window.google.maps.LatLngBounds();
        (this.markers || []).forEach(marker => marker.setMap(null));
        this.markers = places.map(({lat, lng, name}) => {
          bounds.extend({lat, lng});
          return new window.google.maps.Marker({
            position: {lat, lng},
            map: map,
            icon: icon,
            title: name
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
