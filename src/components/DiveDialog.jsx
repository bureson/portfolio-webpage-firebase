import React, { Component } from 'react';
import { getDatabase, ref, onValue, set, push, child } from 'firebase/database';

import Dialog from './Dialog';
import { classNames, convertTimestamp } from '../lib/Shared';

const DIVE_KINDS = ['Reef', 'Wreck', 'Deep', 'Night', 'Lake', 'Quarry', 'Nitrox'];

class DiveDialog extends Component {

  constructor(props) {
    super(props);
    const dive = props.dive;
    this.state = {
      country: props.country,
      no: (dive && dive.no) || '',
      site: (dive && dive.site) || '',
      date: convertTimestamp(dive ? dive.date : Math.floor(Date.now() / 1000), 'yyyy-mm-dd'),
      kinds: (dive && dive.kind) ? dive.kind.split(', ') : [],
      depth: (dive && dive.depth) || '',
      time: (dive && dive.time) || '',
      temp: (dive && dive.temp) || '',
      visibility: (dive && dive.visibility) || '',
      weight: (dive && dive.weight) || '',
      tank: (dive && dive.tank) || '',
      note: (dive && dive.note) || ''
    };
  }

  componentDidMount = () => {
    if (this.props.dive) {
      return;
    }
    // suggest the next dive number from the overall log size
    const db = getDatabase();
    onValue(ref(db, 'dive-log'), snapshot => {
      const payload = snapshot.val() || {};
      this.setState(state => state.no === '' ? { no: Object.keys(payload).length + 1 } : null);
    }, { onlyOnce: true });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  onKind = (kind) => {
    this.setState(state => ({
      kinds: state.kinds.includes(kind)
        ? state.kinds.filter(k => k !== kind)
        : DIVE_KINDS.filter(k => state.kinds.includes(k) || k === kind)
    }));
  }

  onSubmit = (e) => {
    if (!this.state.site) {
      return;
    }
    const db = getDatabase();
    const diveKey = this.props.dive ? this.props.dive.key : push(child(ref(db), 'dive-log')).key;
    set(ref(db, `dive-log/${diveKey}`), {
      country: this.state.country,
      no: parseInt(this.state.no, 10) || 0,
      site: this.state.site,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      kind: this.state.kinds.join(', '),
      depth: parseFloat(this.state.depth) || 0,
      time: parseInt(this.state.time, 10) || 0,
      temp: parseFloat(this.state.temp) || 0,
      visibility: parseFloat(this.state.visibility) || 0,
      weight: parseFloat(this.state.weight) || 0,
      tank: parseFloat(this.state.tank) || 0,
      note: this.state.note,
      timestamp: this.props.dive ? this.props.dive.timestamp : Math.floor(Date.now() / 1000)
    }).then(() => this.props.onClose()).catch(console.log);
  }

  render = () => {
    return (
      <Dialog kicker={`Dive log · ${this.props.countryName}`} title={this.props.dive ? 'Edit dive' : 'Log a dive'} onClose={this.props.onClose}>
        <div className='dialog-body'>
          <div className='field-grid site-row'>
            <div className='field'>
              <label>Dive site</label>
              <input value={this.state.site} placeholder='Cenote Angelita ...' onChange={e => this.onChange(e, 'site')} />
            </div>
            <div className='field'>
              <label>Date</label>
              <input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} />
            </div>
            <div className='field'>
              <label>Dive #</label>
              <input type='number' value={this.state.no} onChange={e => this.onChange(e, 'no')} />
            </div>
          </div>
          <div className='field'>
            <label>Dive type</label>
            <div className='type-chips'>
              {DIVE_KINDS.map(kind => (
                <button key={kind} className={classNames('chip', {selected: this.state.kinds.includes(kind)})} onClick={() => this.onKind(kind)}>{kind}</button>
              ))}
            </div>
          </div>
          <div className='field-grid metric-row'>
            <div className='field'>
              <label>↓ Depth (m)</label>
              <input type='number' value={this.state.depth} onChange={e => this.onChange(e, 'depth')} />
            </div>
            <div className='field'>
              <label>◷ Time (min)</label>
              <input type='number' value={this.state.time} onChange={e => this.onChange(e, 'time')} />
            </div>
            <div className='field'>
              <label>≋ Water (°C)</label>
              <input type='number' value={this.state.temp} onChange={e => this.onChange(e, 'temp')} />
            </div>
          </div>
          <div className='field-grid metric-row'>
            <div className='field'>
              <label>◍ Visibility (m)</label>
              <input type='number' value={this.state.visibility} onChange={e => this.onChange(e, 'visibility')} />
            </div>
            <div className='field'>
              <label>⚖ Extra weight (kg)</label>
              <input type='number' value={this.state.weight} onChange={e => this.onChange(e, 'weight')} />
            </div>
            <div className='field'>
              <label>⌭ Tank size (L)</label>
              <input type='number' value={this.state.tank} onChange={e => this.onChange(e, 'tank')} />
            </div>
          </div>
          <div className='field'>
            <label>Note</label>
            <textarea rows='3' value={this.state.note} onChange={e => this.onChange(e, 'note')} />
          </div>
        </div>
        <div className='dialog-foot'>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!this.state.site} onClick={this.onSubmit}>Save dive</button>
        </div>
      </Dialog>
    )
  }

}

export default DiveDialog;
