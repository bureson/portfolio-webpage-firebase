import React, { Component } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';

import Autocomplete from '../components/Autocomplete';
import Dialog from '../components/Dialog';
import Maps from '../components/Maps';

import { convertTimestamp } from '../lib/Shared';

class Places extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: props.country,
      places: [],
      dialog: false,
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
      <div className='places-card'>
        <div className='head'>
          <p className='kicker'>Visited places</p>
          <span className='count'>{this.state.places.length} pins</span>
        </div>
        <Maps places={this.state.places} />
        {(!!this.state.places.length || this.state.authed) && <div className='chips'>
          {this.state.places.map(place => {
            return (
              <div className='chip' key={place.key} title={convertTimestamp(place.date, 'dd:mm:yyyy')}>
                <span>{place.name}</span>
                {this.state.authed && <button onClick={(e) => this.onDelete(e, place.key)}><FontAwesomeIcon icon={faTrash} /></button>}
              </div>
            )
          })}
          {this.state.authed && <button className='chip add' onClick={() => this.setState({dialog: true})}>+</button>}
        </div>}
        {this.state.dialog && <Dialog kicker='Visited places' title='Add a place' onClose={() => this.setState({dialog: false})}>
          <Autocomplete country={this.state.country} onClose={() => this.setState({dialog: false})} />
        </Dialog>}
      </div>
    )
  }
}

export default Places;
