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
    if (!this.state.name) {
      return;
    }
    const db = getDatabase();
    const placeKey = push(child(ref(db), 'place')).key;
    set(ref(db, `place/${placeKey}`), {
      name: this.state.name,
      country: this.state.country,
      lat: this.state.lat,
      lng: this.state.lng,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      timestamp: Math.floor(Date.now() / 1000)
    }).then(() => this.props.onClose()).catch(console.log);
  }

  render = () => {
    return (
      <React.Fragment>
        <div className='dialog-body'>
          <div className='field-grid place-row'>
            <div className='field'>
              <label>Place</label>
              <input ref='autocomplete' placeholder='Search a place ...' />
            </div>
            <div className='field'>
              <label>Date</label>
              <input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} />
            </div>
          </div>
        </div>
        <div className='dialog-foot'>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!this.state.name} onClick={e => this.onSubmit(e)}>Save place</button>
        </div>
      </React.Fragment>
    )
  }

}

export default Autocomplete;
