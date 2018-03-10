import React, { Component } from 'react';
import firebase from 'firebase';

class Autocomplete extends Component {

  constructor(props) {
    super(props);
    this.state = {
      country: props.country,
      date: this.convertTimestamp(Math.floor(Date.now() / 1000)),
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

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${year}-${month}-${day}`;
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
    const placeRef = firebase.database().ref('place');
    placeRef.push({
      name: this.state.name,
      country: this.state.country,
      lat: this.state.lat,
      lng: this.state.lng,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      timestamp: Math.floor(Date.now() / 1000)
    }).catch(e => {
      console.log(e);
    });
  }

  render = () => {
    return (
      <tr>
        <td><input ref='autocomplete' /></td>
        <td><input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} /></td>
        <td>{this.state.lat}</td>
        <td>{this.state.lng}</td>
        <td><button onClick={e => this.onSubmit(e)}>Submit</button></td>
      </tr>
    )
  }

}

export default Autocomplete;
