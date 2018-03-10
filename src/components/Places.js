import React, { Component } from 'react';
import firebase from 'firebase';

import Autocomplete from '../components/Autocomplete';

class Places extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: props.country,
      places: [],
      loading: true
    }
  }

  componentDidMount = () => {
    this.placeRef = firebase.database().ref('place');
    this.placeRef.orderByChild('country').equalTo(this.state.country).on('value', snapshot => {
      const payload = snapshot.val() || {};
      const places = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        places,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.placeRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  onDelete = (e, key) => {
    if (window.confirm('Are you sure you want to remove the place?')) {
      e.preventDefault();
      firebase.database().ref('place').child(key).remove();
    }
  }

  render = () => {
    return (
      <div className='places'>
        <h3>Visited places</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Visited</th>
              <th>Latitude</th>
              <th>Longitude</th>
              {this.state.authed && <th>Controls</th>}
            </tr>
          </thead>
          <tbody>
            {this.state.places.map((place, index) => {
              return (
                <tr key={index}>
                  <td>{place.name}</td>
                  <td>{this.convertTimestamp(place.date)}</td>
                  <td>{place.lat}</td>
                  <td>{place.lng}</td>
                  {this.state.authed && <td>
                    <button onClick={(e) => this.onDelete(e, place.key)}><i className={'fas fa-trash'}></i></button>
                  </td>}
                </tr>
              )
            })}
            {this.state.authed && <Autocomplete country={this.state.country} />}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Places;