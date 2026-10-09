import React, { Component } from 'react';

import { classNames } from '../lib/Shared';
import Dialog from './Dialog';

// per-country outlines pre-projected to the same 1000x500 equirectangular
// frame as the flight map, lazy so the ~130 KB chunk stays out of the
// main bundle
let countryMapPromise = null;
const loadCountryMap = () => {
  if (!countryMapPromise) {
    countryMapPromise = import('../lib/countrymap.json').then(module => module.default);
  }
  return countryMapPromise;
};

// continent frames in map units; with slice the map always covers the
// card, cropping each frame's edges to the card's aspect. Europe gets
// breathing room (Iceland, North Africa) as the default view
const CONTINENTS = [
  { code: 'EU', name: 'Europe', view: [390, 45, 275, 150] },
  { code: 'AS', name: 'Asia', view: [517, 14, 452, 321] },
  { code: 'AF', name: 'Africa', view: [444, 144, 209, 206] },
  { code: 'NA', name: 'North America', view: [0, 14, 433, 246] },
  { code: 'SA', name: 'South America', view: [219, 150, 240, 324] },
  { code: 'OC', name: 'Oceania', view: [748, 230, 252, 173] }
];
// the whole world, Antarctica included, cropped to the landmass
const WORLD_VIEW = [0, 14, 1000, 486];

class WorldMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      countries: null,
      continent: 'EU',
      dialog: false,
      tooltip: null
    };
    this.cardRef = React.createRef();
    this.svgRef = React.createRef();
    this.view = this.props.full ? WORLD_VIEW : CONTINENTS[0].view;
  }

  componentDidMount = () => {
    loadCountryMap().then(countries => this.setState({ countries }));
  }

  componentWillUnmount = () => {
    cancelAnimationFrame(this.anim);
  }

  selectContinent = (continent) => {
    if (continent.code === this.state.continent) return;
    this.setState({ continent: continent.code, tooltip: null });
    this.animateTo(continent.view);
  }

  animateTo = (target) => {
    cancelAnimationFrame(this.anim);
    const svg = this.svgRef.current;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.view = [...target];
      svg.setAttribute('viewBox', target.join(' '));
      return;
    }
    const from = [...this.view];
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 500, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.view = from.map((v, i) => v + (target[i] - v) * ease);
      svg.setAttribute('viewBox', this.view.join(' '));
      if (t < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  onHover = (e) => {
    const hit = e.target.closest('path[data-label]');
    if (!hit) {
      if (this.state.tooltip) this.setState({ tooltip: null });
      return;
    }
    const rect = this.cardRef.current.getBoundingClientRect();
    this.setState({ tooltip: { label: hit.dataset.label, x: e.clientX - rect.left, y: e.clientY - rect.top } });
  }

  render = () => {
    const full = this.props.full;
    if (!this.state.countries) {
      return <div className={classNames('world-map', 'skeleton', {full})} />;
    }
    const visited = this.props.countryList.reduce((map, country) => {
      const iso = (country.iso || '').toUpperCase();
      if (iso) map[iso] = country;
      return map;
    }, {});
    return (
      <React.Fragment>
        <div className={classNames('world-map', {full})} ref={this.cardRef}>
          {/* the viewBox animates imperatively on continent change; React
              leaves the attribute alone as long as the JSX value is stable */}
          <svg ref={this.svgRef} viewBox={this.view.join(' ')} preserveAspectRatio={full ? 'xMidYMid meet' : 'xMidYMid slice'}
               role='img' aria-label='Map highlighting visited countries'
               onMouseMove={this.onHover} onMouseLeave={() => this.setState({tooltip: null})}>
            {Object.keys(this.state.countries).map(iso => {
              const country = visited[iso];
              return <path key={iso} className={classNames('country', {visited: !!country})} d={this.state.countries[iso]}
                           data-label={country && `Visited ${country.name} in ${new Date(country.date * 1000).getFullYear()}`} />
            })}
          </svg>
          {!full && (
            <div className='continents'>
              {CONTINENTS.map(continent => (
                <button key={continent.code} title={continent.name}
                        className={classNames({active: this.state.continent === continent.code})}
                        onClick={() => this.selectContinent(continent)}>{continent.code}</button>
              ))}
            </div>
          )}
          {!full && <button className='expand' onClick={() => this.setState({dialog: true})}>⤢ Full map</button>}
          {this.state.tooltip && <div className='tooltip' style={{left: this.state.tooltip.x, top: this.state.tooltip.y}}>{this.state.tooltip.label}</div>}
        </div>
        {this.state.dialog && (
          <Dialog className='map-dialog' kicker='Countries log' title='All visited countries' onClose={() => this.setState({dialog: false})}>
            <div className='map-full'>
              <WorldMap countryList={this.props.countryList} full />
            </div>
          </Dialog>
        )}
      </React.Fragment>
    )
  }

}

export default WorldMap;
