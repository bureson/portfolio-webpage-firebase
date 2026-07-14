import React, { Component } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';

import DiveDialog from './DiveDialog';
import { convertTimestamp } from '../lib/Shared';

class DiveLog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: props.country,
      dives: [],
      dialog: false,
      editing: null,
      loading: true
    }
  }

  componentDidMount = () => {
    const db = getDatabase();
    const diveRef = query(ref(db, 'dive-log'), orderByChild('country'), equalTo(this.state.country));
    onValue(diveRef, snapshot => {
      const payload = snapshot.val() || {};
      const dives = Object.keys(payload)
            .sort((a, b) => payload[a].date - payload[b].date || payload[a].no - payload[b].no)
            .map(key => Object.assign({ key }, payload[key]));
      this.setState({
        dives,
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
    if (window.confirm('Are you sure you want to remove the dive?')) {
      const db = getDatabase();
      const diveRef = ref(db, `dive-log/${key}`);
      remove(diveRef);
    }
  }

  render = () => {
    const dives = this.state.dives;
    if (this.state.loading || (!this.state.authed && !dives.length)) {
      return null;
    }
    const depths = dives.map(dive => dive.depth).filter(depth => depth > 0);
    const times = dives.map(dive => dive.time).filter(time => time > 0);
    const temps = dives.map(dive => dive.temp).filter(temp => temp > 0);
    const bottomTime = times.reduce((sum, time) => sum + time, 0);
    const bottomTimeLabel = bottomTime < 60 ? `${bottomTime} min` : `${Math.floor(bottomTime / 60)} h ${bottomTime % 60} min`;
    return (
      <div className='dive-log'>
        <div className='head'>
          <div>
            <p className='kicker'>Dive log</p>
            <h2>{dives.length} {dives.length === 1 ? 'dive' : 'dives'} in {this.props.countryName}</h2>
          </div>
          {!!dives.length && <div className='stats'>
            {!!depths.length && <div className='stat'>
              <div className='value'>{Math.max(...depths)} m</div>
              <div className='label'>deepest</div>
            </div>}
            {!!times.length && <div className='stat'>
              <div className='value'>{bottomTimeLabel}</div>
              <div className='label'>bottom time</div>
            </div>}
            {!!temps.length && <div className='stat'>
              <div className='value'>{Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length)} °C</div>
              <div className='label'>avg water</div>
            </div>}
          </div>}
        </div>
        <div className='dive-grid'>
          {dives.map(dive => {
            return (
              <div className='dive-card' key={dive.key}>
                <div className='top'>
                  <div className='ident'>
                    {!!dive.no && <span className='no'>#{dive.no}</span>}
                    <span className='site'>{dive.site}</span>
                    {dive.kind && dive.kind.split(', ').map(kind => <span className='chip' key={kind}>{kind}</span>)}
                  </div>
                  <div className='when'>
                    {convertTimestamp(dive.date, 'dd:mm:yyyy')}
                    {this.state.authed && <button onClick={() => this.setState({dialog: true, editing: dive})}><FontAwesomeIcon icon={faEdit} /></button>}
                    {this.state.authed && <button onClick={(e) => this.onDelete(e, dive.key)}><FontAwesomeIcon icon={faTrash} /></button>}
                  </div>
                </div>
                <div className='metrics'>
                  {dive.depth > 0 && <span>↓ {dive.depth} m</span>}
                  {dive.time > 0 && <span>◷ {dive.time} min</span>}
                  {dive.temp > 0 && <span>≋ {dive.temp} °C</span>}
                  {dive.visibility > 0 && <span>◍ {dive.visibility} m</span>}
                  {dive.weight > 0 && <span>⚖ {dive.weight} kg</span>}
                  {dive.tank > 0 && <span>⌭ {dive.tank} L</span>}
                </div>
                {this.state.authed && dive.note && <div className='note'>{dive.note}</div>}
              </div>
            )
          })}
        </div>
        {this.state.authed && <button className='log-add' onClick={() => this.setState({dialog: true})}>+ log a dive</button>}
        {this.state.dialog && <DiveDialog country={this.state.country} countryName={this.props.countryName} dive={this.state.editing} onClose={() => this.setState({dialog: false, editing: null})} />}
      </div>
    )
  }

}

export default DiveLog;
