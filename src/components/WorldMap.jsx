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
// breathing room (Iceland, North Africa) as the default view. Oceania is
// deliberately tall: slice then fits its width, so neither edge gets
// cropped. It runs past the map's right edge (x > 1000) onto the wrapped
// copy of the Pacific islands, which is where French Polynesia lands
const CONTINENTS = [
  { code: 'EU', name: 'Europe', view: [390, 45, 275, 150] },
  { code: 'AS', name: 'Asia', view: [517, 14, 452, 321] },
  { code: 'AF', name: 'Africa', view: [444, 144, 209, 206] },
  { code: 'NA', name: 'North America', view: [0, 14, 433, 246] },
  { code: 'SA', name: 'South America', view: [219, 150, 240, 324] },
  { code: 'OC', name: 'Oceania', view: [800, 109, 295, 440] }
];
// countries lying entirely east of the antimeridian up to this x (the
// Pacific islands at the map's left edge) are drawn a second time one map
// width to the right, so Oceania reads as one piece
const WRAP_MAX_X = 170;
// visited countries smaller than this (map units, either side) get a dot
// on top, their outline alone is a sub-pixel speck
const MARKER_MAX_SIZE = 1.5;
const MARKER_RADIUS = 1.5;
// the card cycles through the continents on its own until a chip is
// picked; slow enough not to nag beside the intro text
const ROTATE_INTERVAL = 7000;

// outlines only use absolute M/L commands, so the numbers are x,y pairs
const getBox = (d) => {
  const numbers = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    box.minX = Math.min(box.minX, numbers[i]);
    box.maxX = Math.max(box.maxX, numbers[i]);
    box.minY = Math.min(box.minY, numbers[i + 1]);
    box.maxY = Math.max(box.maxY, numbers[i + 1]);
  }
  return box;
};
// the whole world, Antarctica included, cropped to the landmass
const WORLD_VIEW = [0, 14, 1000, 486];

class WorldMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      auto: false,
      countries: null,
      continent: 'EU',
      dialog: false,
      playing: false,
      tick: 0,
      tooltip: null
    };
    this.cardRef = React.createRef();
    this.svgRef = React.createRef();
    this.continentsRef = React.createRef();
    this.indicatorRef = React.createRef();
    this.view = this.props.full ? WORLD_VIEW : CONTINENTS[0].view;
  }

  componentDidMount = () => {
    // StrictMode mounts, unmounts and remounts the same instance in dev
    this.unmounted = false;
    loadCountryMap().then(countries => {
      this.boxes = Object.keys(countries).reduce((boxes, iso) => {
        boxes[iso] = getBox(countries[iso]);
        return boxes;
      }, {});
      if (this.unmounted) return;
      // the countdown starts once the chips are on screen, so the progress
      // ring and the timer run in step
      this.setState({ countries, auto: this.rotating }, this.scheduleRotation);
    });
    // no auto-rotation in the full map, and reduced-motion visitors only
    // get it by pressing play
    this.rotating = !this.props.full && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  componentWillUnmount = () => {
    this.unmounted = true;
    cancelAnimationFrame(this.anim);
    clearTimeout(this.rotateTimer);
  }

  componentDidUpdate = () => {
    this.positionIndicator();
  }

  // the gold frame is a separate element laid over the active chip, so it
  // can glide from one chip to the next; the first placement snaps
  positionIndicator = () => {
    const indicator = this.indicatorRef.current;
    const active = this.continentsRef.current && this.continentsRef.current.querySelector('button.active');
    if (!indicator || !active) return;
    const first = !indicator.style.opacity;
    if (first) indicator.style.transition = 'none';
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    indicator.style.opacity = 1;
    if (first) {
      // flush the snapped position before transitions come back
      indicator.getBoundingClientRect();
      indicator.style.transition = '';
    }
  }

  scheduleRotation = () => {
    clearTimeout(this.rotateTimer);
    if (!this.rotating || !this.state.countries) return;
    // a new tick remounts the progress ring, restarting its animation
    this.setState(state => ({ playing: true, tick: state.tick + 1 }));
    this.rotateTimer = setTimeout(() => {
      // sit out the turn while nobody can see the card
      if (this.state.countries && !this.state.dialog && !document.hidden) {
        const index = CONTINENTS.findIndex(continent => continent.code === this.state.continent);
        this.selectContinent(CONTINENTS[(index + 1) % CONTINENTS.length]);
      }
      this.scheduleRotation();
    }, ROTATE_INTERVAL);
  }

  // hovering holds the current frame, the full interval restarts on leave
  pauseRotation = () => {
    clearTimeout(this.rotateTimer);
    if (this.state.playing) this.setState({ playing: false });
  }

  // picking a chip takes over until play is pressed again
  pickContinent = (continent) => {
    this.rotating = false;
    clearTimeout(this.rotateTimer);
    this.setState({ auto: false, playing: false });
    this.selectContinent(continent);
  }

  // this.rotating is the source of truth for the timer, state.auto mirrors
  // it for the button's icon
  toggleRotation = () => {
    this.rotating = !this.rotating;
    this.setState({ auto: this.rotating, playing: false });
    // starts right away even though the pointer is over the card
    this.scheduleRotation();
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
    const hit = e.target.closest('[data-label]');
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
    const renderCountry = (iso) => {
      const country = visited[iso];
      const box = this.boxes[iso];
      const label = country && `Visited ${country.name} in ${new Date(country.date * 1000).getFullYear()}`;
      const tiny = country && box.maxX - box.minX < MARKER_MAX_SIZE && box.maxY - box.minY < MARKER_MAX_SIZE;
      return (
        <React.Fragment key={iso}>
          <path className={classNames('country', {visited: !!country})} d={this.state.countries[iso]} data-label={label} />
          {tiny && <circle className='country visited' cx={(box.minX + box.maxX) / 2} cy={(box.minY + box.maxY) / 2} r={MARKER_RADIUS} data-label={label} />}
        </React.Fragment>
      );
    };
    const isoList = Object.keys(this.state.countries);
    return (
      <React.Fragment>
        <div className={classNames('world-map', {full})} ref={this.cardRef}
             onMouseEnter={this.pauseRotation} onMouseLeave={this.scheduleRotation}>
          {/* the viewBox animates imperatively on continent change; React
              leaves the attribute alone as long as the JSX value is stable */}
          <svg ref={this.svgRef} viewBox={this.view.join(' ')} preserveAspectRatio={full ? 'xMidYMid meet' : 'xMidYMid slice'}
               role='img' aria-label='Map highlighting visited countries'
               onMouseMove={this.onHover} onMouseLeave={() => this.setState({tooltip: null})}>
            {isoList.map(renderCountry)}
            {/* only the card needs the wrapped copy; in the full map meet
                would letterbox it into view beside the real one */}
            {!full && (
              <g transform='translate(1000 0)'>
                {isoList.filter(iso => this.boxes[iso].maxX < WRAP_MAX_X).map(renderCountry)}
              </g>
            )}
          </svg>
          {!full && (
            <div className='continents' ref={this.continentsRef}>
              <span className='indicator' ref={this.indicatorRef} />
              {/* play/pause for the auto-rotation; the ring fills up over
                  the interval and a new tick remounts it to restart */}
              <button className='player' onClick={this.toggleRotation}
                      title={this.state.auto ? 'Pause rotation' : 'Play rotation'}
                      aria-label={this.state.auto ? 'Pause rotation' : 'Play rotation'}>
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  <circle className='track' cx='12' cy='12' r='10.5' />
                  {this.state.playing &&
                    <circle className='ring' key={this.state.tick} cx='12' cy='12' r='10.5' pathLength='100'
                            transform='rotate(-90 12 12)' style={{animationDuration: `${ROTATE_INTERVAL}ms`}} />}
                  {this.state.auto
                    ? <path className='pause' d='M9.75 8.25v7.5M14.25 8.25v7.5' />
                    : <path className='play' d='M10 7.75l6.5 4.25-6.5 4.25z' />}
                </svg>
              </button>
              <span className='divider' />
              {CONTINENTS.map(continent => (
                <button key={continent.code} title={continent.name}
                        className={classNames({active: this.state.continent === continent.code})}
                        onClick={() => this.pickContinent(continent)}>
                  {continent.code}
                </button>
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
