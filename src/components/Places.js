import React, { Component } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';

import Autocomplete from '../components/Autocomplete';
import Maps from '../components/Maps';

import { convertTimestamp } from '../lib/Shared';

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
    const db = getDatabase();
    const placeRef = query(ref(db, 'place'), orderByChild('country'), equalTo(this.state.country));
    onValue(placeRef, snapshot => {
      const payload = snapshot.val() || {};
      const places = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({ key }, payload[key]));
      this.setState({
        places,
        loading: false
      });
    });
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the place?')) {
      const db = getDatabase();
      const placeRef = ref(db, `place/${key}`);
      remove(placeRef);
    }
  }

  render = () => {
    return (
      <div className='places'>
        <h3>Visited places</h3>
        <Maps places={this.state.places} />
        <div className='table-container'>
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
                    <td>{convertTimestamp(place.date)}</td>
                    <td>{place.lat.toString().substring(0, 9)}</td>
                    <td>{place.lng.toString().substring(0, 9)}</td>
                    {this.state.authed && <td>
                      <button onClick={(e) => this.onDelete(e, place.key)}><FontAwesomeIcon icon={faTrash} /></button>
                    </td>}
                  </tr>
                )
              })}
              {this.state.authed && <Autocomplete country={this.state.country} />}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Places;
