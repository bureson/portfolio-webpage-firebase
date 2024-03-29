import React, { Component } from 'react';
import { getDatabase, ref, set, push, child } from 'firebase/database';

import { convertTimestamp } from '../lib/Shared';

class Autocomplete extends Component {

  constructor(props) {
    super(props);
    this.state = {
      country: props.country,
      date: convertTimestamp(Math.floor(Date.now() / 1000), 'yyyy-mm-dd'),
      lat: '',
      lng: '',
      name: ''
    };
  }

  componentDidMount = () => {
    this.autocomplete = new window.google.maps.places.Autocomplete(this.refs.autocomplete, {types: ['geocode']});
    this.event = this.autocomplete.addListener('place_changed', this.onSelected.bind(this));
  }

  componentWillUnmount() {
    this.event.remove();
  }

  onSelected = () => {
    const place = this.autocomplete.getPlace();
    this.setState({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      name: place.name
    });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  onSubmit = (e) => {
    const db = getDatabase();
    const placeKey = push(child(ref(db), 'place')).key;
    set(ref(db, `place/${placeKey}`), {
      name: this.state.name,
      country: this.state.country,
      lat: this.state.lat,
      lng: this.state.lng,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      timestamp: Math.floor(Date.now() / 1000)
    }).catch(console.log);
  }

  render = () => {
    return (
      <tr>
        <td><input ref='autocomplete' /></td>
        <td><input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} /></td>
        <td>{this.state.lat.toString().substring(0, 9)}</td>
        <td>{this.state.lng.toString().substring(0, 9)}</td>
        <td><button onClick={e => this.onSubmit(e)}>Submit</button></td>
      </tr>
    )
  }

}

export default Autocomplete;
