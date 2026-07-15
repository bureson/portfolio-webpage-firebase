import React, { Component } from 'react';

import { classNames } from '../lib/Shared';
import { flightTotals, flightYear, formatKm } from '../lib/Flights';

class FlightTimeline extends Component {

  onBar = (year) => {
    this.props.onYear(this.props.year === year ? null : year);
  }

  render = () => {
    const kmByYear = new Map();
    this.props.flights.forEach(flight => {
      const year = flightYear(flight);
      kmByYear.set(year, (kmByYear.get(year) || 0) + flightTotals(flight).km);
    });
    if (kmByYear.size < 2) {
      return null;
    }
    const years = [...kmByYear.keys()];
    const first = Math.min(...years);
    const last = Math.max(...years);
    const maxKm = Math.max(...kmByYear.values());
    const selected = this.props.year;
    const columns = [];
    // a continuous range, so gap years read as negative space
    for (let year = first; year <= last; year++) {
      const km = kmByYear.get(year) || 0;
      const height = km ? Math.max(6, Math.round(Math.sqrt(km / maxKm) * 46)) : 2;
      columns.push(
        <div className={classNames('col', {active: year === selected, empty: !km})} key={year}>
          <button className='bar' style={{height}} title={`${year} · ${formatKm(km)}`} disabled={!km} onClick={() => this.onBar(year)}></button>
          <div className='year'>{year}</div>
        </div>
      );
    }
    return (
      <div className='flight-timeline'>
        <div className='bars'>{columns}</div>
      </div>
    )
  }

}

export default FlightTimeline;
