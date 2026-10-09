import React, { Component, Fragment } from 'react';
import { getDatabase, ref, set, push, child } from 'firebase/database';

import Dialog from './Dialog';
import { classNames, convertTimestamp } from '../lib/Shared';
import { loadAirports, resolveLeg, formatKm, formatCO2 } from '../lib/Flights';

// legs carry a stable id so async resolves survive reordering and removal
let legSeq = 0;
const emptyLeg = (from) => ({ id: ++legSeq, from: from || '', to: '', km: 0, co2: 0, estimated: false, status: 'empty' });

class FlightDialog extends Component {

  constructor(props) {
    super(props);
    const flight = props.flight;
    this.state = {
      title: (flight && flight.title) || '',
      date: convertTimestamp(flight ? flight.date : Math.floor(Date.now() / 1000), 'yyyy-mm-dd'),
      countryKeys: (flight && flight.countries) || [],
      countryQuery: '',
      legs: (flight && flight.legs) ? flight.legs.map(leg => Object.assign({ id: ++legSeq, status: 'done' }, leg)) : [emptyLeg()],
      // stored flights already hold the return legs expanded, so editing is one way
      returnTrip: !flight,
      dragIndex: null,
      airports: null,
      saving: false
    };
  }

  componentDidMount = () => {
    loadAirports().then(airports => this.setState({ airports }));
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  countryMatches = () => {
    const countries = this.props.countries || {};
    const query = this.state.countryQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }
    return Object.keys(countries)
      .filter(key => !this.state.countryKeys.includes(key) && countries[key].name.toLowerCase().includes(query))
      .sort((a, b) => countries[a].name.localeCompare(countries[b].name))
      .slice(0, 6);
  }

  onCountryAdd = (key) => {
    this.setState(state => ({
      countryKeys: state.countryKeys.includes(key) ? state.countryKeys : [...state.countryKeys, key],
      countryQuery: ''
    }));
  }

  onCountryRemove = (key) => {
    this.setState(state => ({
      countryKeys: state.countryKeys.filter(k => k !== key)
    }));
  }

  onCountryKey = (e, matches) => {
    if (e.key === 'Enter' && matches.length) {
      e.preventDefault();
      this.onCountryAdd(matches[0]);
    }
    if (e.key === 'Backspace' && !this.state.countryQuery && this.state.countryKeys.length) {
      this.onCountryRemove(this.state.countryKeys[this.state.countryKeys.length - 1]);
    }
  }

  onLegCode = (index, side, value) => {
    const code = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    this.setState(state => ({
      legs: state.legs.map((leg, i) => i === index ? Object.assign({}, leg, { [side]: code, status: 'empty', km: 0, co2: 0 }) : leg)
    }), () => this.resolveLeg(this.state.legs[index]));
  }

  onAddLeg = () => {
    this.setState(state => {
      const last = state.legs[state.legs.length - 1];
      return { legs: [...state.legs, emptyLeg(last && last.status === 'done' ? last.to : '')] };
    });
  }

  onRemoveLeg = (index) => {
    this.setState(state => ({
      legs: state.legs.length > 1 ? state.legs.filter((leg, i) => i !== index) : [emptyLeg()]
    }));
  }

  // rows are only draggable once the grab handle is pressed, so text
  // selection inside the code inputs keeps working
  onArmDrag = (index) => {
    this.dragArmed = index;
  }

  onDragStart = (e, index) => {
    if (this.dragArmed !== index) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    this.setState({ dragIndex: index });
  }

  onDragOver = (e, index) => {
    e.preventDefault();
    this.setState(state => {
      if (state.dragIndex === null || state.dragIndex === index) {
        return null;
      }
      const legs = [...state.legs];
      const [moved] = legs.splice(state.dragIndex, 1);
      legs.splice(index, 0, moved);
      return { legs, dragIndex: index };
    });
  }

  onDragEnd = () => {
    this.dragArmed = null;
    this.setState({ dragIndex: null });
  }

  // once both codes of the leg are complete, compute the distance and
  // fetch the CO2 footprint from the Travel Impact Model API
  resolveLeg = (leg) => {
    if (leg.from.length !== 3 || leg.to.length !== 3) {
      return;
    }
    if (this.state.airports && (!this.state.airports[leg.from] || !this.state.airports[leg.to])) {
      this.updateLeg(leg, { status: 'unknown' });
      return;
    }
    this.updateLeg(leg, { status: 'loading' });
    resolveLeg(leg.from, leg.to)
      .then(({ km, co2, estimated }) => this.updateLeg(leg, { km, co2, estimated, status: 'done' }))
      .catch(() => this.updateLeg(leg, { status: 'unknown' }));
  }

  // apply patch only if the leg still holds the codes it was resolved for
  updateLeg = (leg, patch) => {
    this.setState(state => {
      const current = state.legs.find(l => l.id === leg.id);
      if (!current || current.from !== leg.from || current.to !== leg.to) {
        return null;
      }
      return { legs: state.legs.map(l => l.id === leg.id ? Object.assign({}, l, patch) : l) };
    });
  }

  onSubmit = () => {
    const done = this.state.legs.filter(leg => leg.status === 'done');
    if (!this.state.title || !done.length) {
      return;
    }
    this.setState({ saving: true });
    let legs = done.map(leg => ({
      from: leg.from,
      to: leg.to,
      km: leg.km,
      co2: leg.co2,
      estimated: leg.estimated || false
    }));
    if (this.state.returnTrip) {
      legs = legs.concat([...legs].reverse().map(leg => Object.assign({}, leg, { from: leg.to, to: leg.from })));
    }
    const db = getDatabase();
    const flightKey = this.props.flight ? this.props.flight.key : push(child(ref(db), 'flight-log')).key;
    set(ref(db, `flight-log/${flightKey}`), {
      title: this.state.title,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      countries: this.state.countryKeys,
      legs,
      timestamp: this.props.flight ? this.props.flight.timestamp : Math.floor(Date.now() / 1000)
    }).then(() => this.props.onClose()).catch(error => {
      console.log(error);
      this.setState({ saving: false });
    });
  }

  // clicking anywhere inside a bordered input box focuses its input
  onFocusBox = (e) => {
    e.currentTarget.querySelector('input').focus();
  }

  placeLabel = (code) => {
    const airports = this.state.airports;
    const entry = code.length === 3 && airports && airports[code];
    return entry ? entry[2] : '';
  }

  // for the first unresolvable code, offer nearby codes to click instead
  unknownLeg = () => {
    const airports = this.state.airports;
    if (!airports) {
      return null;
    }
    for (let index = 0; index < this.state.legs.length; index++) {
      const leg = this.state.legs[index];
      if (leg.status !== 'unknown') {
        continue;
      }
      const side = airports[leg.from] ? 'to' : 'from';
      const code = leg[side];
      const codes = Object.keys(airports);
      const pool = codes.filter(c => c.startsWith(code.slice(0, 2)));
      const suggestions = (pool.length ? pool : codes.filter(c => c[0] === code[0])).slice(0, 2);
      return { index, side, code, suggestions };
    }
    return null;
  }

  renderCountries = () => {
    const countries = this.props.countries || {};
    if (!Object.keys(countries).length) {
      return null;
    }
    const matches = this.countryMatches();
    return (
      <div className='field'>
        <label>Belongs to countries</label>
        <div className='country-box' onClick={this.onFocusBox}>
          {this.state.countryKeys.filter(key => countries[key]).map(key => (
            <button className='country-pill' key={key} title='Remove country' onClick={() => this.onCountryRemove(key)}>
              <span className='code'>{(countries[key].iso || '').toUpperCase()}</span>
              {countries[key].name}
              <span className='x'>✕</span>
            </button>
          ))}
          <input value={this.state.countryQuery} placeholder='type to add a country ...'
                 onChange={e => this.onChange(e, 'countryQuery')} onKeyDown={e => this.onCountryKey(e, matches)} />
          {!!matches.length && <div className='country-suggest'>
            {matches.map(key => (
              <button key={key} onClick={() => this.onCountryAdd(key)}>
                <span className='code'>{(countries[key].iso || '').toUpperCase()}</span>
                {countries[key].name}
              </button>
            ))}
          </div>}
        </div>
      </div>
    )
  }

  renderLeg = (leg, index) => {
    return (
      <div className={classNames('leg-row', {dragging: index === this.state.dragIndex})} key={leg.id} draggable
           onDragStart={e => this.onDragStart(e, index)} onDragOver={e => this.onDragOver(e, index)}
           onDragEnd={this.onDragEnd} onMouseUp={this.onDragEnd}>
        <div className='handle' title='Drag to reorder' onMouseDown={() => this.onArmDrag(index)}>⠿</div>
        <div className='code-box' onClick={this.onFocusBox}>
          <input value={leg.from} placeholder='PRG' onChange={e => this.onLegCode(index, 'from', e.target.value)} />
          <span className='place'>{this.placeLabel(leg.from)}</span>
        </div>
        <div className='code-box' onClick={this.onFocusBox}>
          <input value={leg.to} placeholder='IST' onChange={e => this.onLegCode(index, 'to', e.target.value)} />
          <span className='place'>{this.placeLabel(leg.to)}</span>
        </div>
        <div className='cell km'>{leg.status === 'done' ? formatKm(leg.km) : leg.status === 'loading' ? '...' : ''}</div>
        <div className='cell co2' title={leg.estimated ? 'estimated' : undefined}>
          {leg.status === 'done' ? `${formatCO2(leg.co2)}${leg.estimated ? '*' : ''}` : ''}
        </div>
        <button className='remove' title='Remove leg' onClick={() => this.onRemoveLeg(index)}>✕</button>
      </div>
    )
  }

  renderSuggest = () => {
    const unknown = this.unknownLeg();
    if (!unknown) {
      return null;
    }
    const airports = this.state.airports;
    if (!unknown.suggestions.length) {
      return <div className='leg-suggest'>{unknown.code} — unknown airport code</div>;
    }
    return (
      <div className='leg-suggest'>
        {unknown.code} — did you mean {unknown.suggestions.map((code, i) => (
          <Fragment key={code}>
            {i > 0 && ', '}
            <button onClick={() => this.onLegCode(unknown.index, unknown.side, code)}>{airports[code][2]} ({code})</button>
          </Fragment>
        ))}?
      </div>
    )
  }

  render = () => {
    const done = this.state.legs.filter(leg => leg.status === 'done');
    const legsReady = done.length > 0
          && this.state.legs.every(leg => leg.status === 'done' || (leg.from === '' && leg.to === ''));
    const factor = this.state.returnTrip ? 2 : 1;
    const legCount = done.length * factor;
    const totals = {
      km: done.reduce((sum, leg) => sum + leg.km, 0) * factor,
      co2: done.reduce((sum, leg) => sum + leg.co2, 0) * factor
    };
    return (
      <Dialog className='wide' kicker='Flight log' title={this.props.flight ? 'Edit flight' : 'Add a flight'} onClose={this.props.onClose}>
        <div className='dialog-body'>
          <div className='field-grid place-row'>
            <div className='field'>
              <label>Trip name</label>
              <input value={this.state.title} placeholder='Mauritius with family ...' onChange={e => this.onChange(e, 'title')} />
            </div>
            <div className='field'>
              <label>Date</label>
              <input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} />
            </div>
          </div>
          {this.renderCountries()}
          <div className='field'>
            <div className='label-row'>
              <label>Legs</label>
              <span className='note'>distances &amp; CO₂ computed from airports</span>
            </div>
            <div className='leg-table'>
              {this.state.legs.map(this.renderLeg)}
              <button className='leg-add' onClick={this.onAddLeg}>+ add a leg <span>— departure prefills from the last arrival</span></button>
            </div>
            {this.renderSuggest()}
          </div>
          <div className='return-row type-chips'>
            <span className='label'>Return trip</span>
            <button className={classNames('chip', {selected: this.state.returnTrip})} onClick={() => this.setState({returnTrip: true})}>Mirror the legs back</button>
            <button className={classNames('chip', {selected: !this.state.returnTrip})} onClick={() => this.setState({returnTrip: false})}>One way</button>
          </div>
        </div>
        <div className='dialog-foot'>
          {!!done.length && <div className='totals'>
            <span>{legCount} {legCount === 1 ? 'leg' : 'legs'}{this.state.returnTrip ? ' with return' : ''}</span>
            <span>→ {formatKm(totals.km)}</span>
            <span className='co2'>☁ {formatCO2(totals.co2)}</span>
          </div>}
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!this.state.title || !legsReady || this.state.saving} onClick={this.onSubmit}>Save flight</button>
        </div>
      </Dialog>
    )
  }

}

export default FlightDialog;
