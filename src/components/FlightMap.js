import React, { Component } from 'react';

import { classNames } from '../lib/Shared';
import { loadAirports, loadWorldMap, formatKm } from '../lib/Flights';

const W = 1000, H = 500;
const MAX_ZOOM = 12;
// auto-fit on a year filter zooms gentler than manual zoom so the
// routes keep their global context; padding also covers the arc lift
const FIT_ZOOM = 5, FIT_PAD = 48;
const px = (lon) => (lon + 180) / 360 * W;
const py = (lat) => (90 - lat) / 180 * H;
const r1 = (n) => Math.round(n * 10) / 10;

class FlightMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      airports: null,
      world: null,
      tooltip: null,
      panning: false
    };
    this.svgRef = React.createRef();
    this.cardRef = React.createRef();
    this.pointers = new Map();
    this.pinchStart = null;
    this.view = null;
  }

  componentDidMount = () => {
    Promise.all([loadAirports(), loadWorldMap()]).then(([airports, world]) => this.setState({ airports, world }));
  }

  componentDidUpdate = (prevProps) => {
    // React wheel handlers are passive, attach natively so zoom can
    // preventDefault the page scroll
    const svg = this.svgRef.current;
    if (svg && !this.wheelBound) {
      this.wheelBound = true;
      svg.addEventListener('wheel', this.onWheel, { passive: false });
    }
    if (prevProps.flights !== this.props.flights) {
      this.animateTo(this.fitView());
    }
  }

  componentWillUnmount = () => {
    cancelAnimationFrame(this.anim);
    if (this.svgRef.current) {
      this.svgRef.current.removeEventListener('wheel', this.onWheel);
    }
  }

  // dedupe the legs of all flights into unique routes plus visit
  // counts per airport
  mapData = () => {
    const airports = this.state.airports;
    const routes = new Map();
    const visits = new Map();
    this.props.flights.forEach(flight => (flight.legs || []).forEach(leg => {
      if (!airports[leg.from] || !airports[leg.to]) return;
      [leg.from, leg.to].forEach(code => visits.set(code, (visits.get(code) || 0) + 1));
      const [a, b] = [leg.from, leg.to].sort();
      const key = `${a}-${b}`;
      if (!routes.has(key)) routes.set(key, { a, b, km: leg.km, count: 0 });
      routes.get(key).count++;
    }));
    return { routes: [...routes.values()].sort((a, b) => a.count - b.count), visits: [...visits.entries()] };
  }

  // full width, cropped vertically to the latitudes actually flown;
  // derived from baseFlights (when given) so a year filter changes the
  // routes but never the card shape
  baseView = () => {
    const airports = this.state.airports;
    const flights = this.props.baseFlights || this.props.flights;
    let yMin = H, yMax = 0;
    flights.forEach(flight => (flight.legs || []).forEach(leg => {
      [leg.from, leg.to].forEach(code => {
        if (!airports[code]) return;
        const y = py(airports[code][0]);
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      });
    }));
    yMin = Math.max(0, yMin - 40);
    yMax = Math.min(H, yMax + 40);
    return { x: 0, y: r1(yMin), w: W, h: r1(yMax - yMin) };
  }

  // quadratic arc bowing away from the equator, like a great circle;
  // routes crossing the antimeridian take the short way off the map edge
  // and `wrap` tells the renderer where to draw the re-entering copy
  arcFor = (a, b) => {
    const airports = this.state.airports;
    const [latA, lonA] = airports[a];
    const [latB, lonBTrue] = airports[b];
    let lonB = lonBTrue;
    let wrap = 0;
    if (lonB - lonA > 180) {
      lonB -= 360;
      wrap = W;
    } else if (lonA - lonB > 180) {
      lonB += 360;
      wrap = -W;
    }
    const x1 = px(lonA), y1 = py(latA), x2 = px(lonB), y2 = py(latB);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    let nx = -dy / len, ny = dx / len;
    const poleward = my < H / 2 ? -1 : 1;
    if (Math.sign(ny) !== poleward) { nx = -nx; ny = -ny; }
    const lift = Math.min(len * 0.18, 46);
    return { d: `M${r1(x1)} ${r1(y1)}Q${r1(mx + nx * lift)} ${r1(my + ny * lift)} ${r1(x2)} ${r1(y2)}`, wrap };
  }

  // view that frames the current (filtered) flights at the card's
  // aspect ratio; the full set just gets the base view back
  fitView = () => {
    const base = this.base;
    if (!this.props.baseFlights || this.props.flights === this.props.baseFlights) {
      return Object.assign({}, base);
    }
    const airports = this.state.airports;
    let xMin = W, xMax = 0, yMin = H, yMax = 0;
    this.props.flights.forEach(flight => (flight.legs || []).forEach(leg => {
      [leg.from, leg.to].forEach(code => {
        if (!airports[code]) return;
        const [lat, lon] = airports[code];
        const x = px(lon), y = py(lat);
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      });
    }));
    if (xMin > xMax) {
      return Object.assign({}, base);
    }
    const aspect = base.w / base.h;
    let w = Math.max(xMax - xMin + FIT_PAD * 2, (yMax - yMin + FIT_PAD * 2) * aspect, base.w / FIT_ZOOM);
    w = Math.min(w, base.w);
    const h = w / aspect;
    return {
      x: Math.min(Math.max((xMin + xMax - w) / 2, base.x), base.x + base.w - w),
      y: Math.min(Math.max((yMin + yMax - h) / 2, base.y), base.y + base.h - h),
      w, h
    };
  }

  animateTo = (target) => {
    cancelAnimationFrame(this.anim);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.view = Object.assign({}, target);
      this.applyView();
      return;
    }
    const from = Object.assign({}, this.view || this.base);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 450, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.view = {
        x: from.x + (target.x - from.x) * ease,
        y: from.y + (target.y - from.y) * ease,
        w: from.w + (target.w - from.w) * ease,
        h: from.h + (target.h - from.h) * ease
      };
      this.applyView();
      if (t < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  // --- zoom & pan, imperative on the svg so React stays out of the hot path ---

  applyView = () => {
    const svg = this.svgRef.current;
    if (!svg || !this.base) return;
    const base = this.base;
    const view = this.view || (this.view = Object.assign({}, base));
    view.w = Math.min(Math.max(view.w, base.w / MAX_ZOOM), base.w);
    view.h = view.w * base.h / base.w;
    view.x = Math.min(Math.max(view.x, base.x), base.x + base.w - view.w);
    view.y = Math.min(Math.max(view.y, base.y), base.y + base.h - view.h);
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    // dots and labels keep their on-screen size while the map scales
    const shrink = Math.sqrt(base.w / view.w);
    svg.querySelectorAll('.airport').forEach(dot => {
      dot.setAttribute('r', (Number(dot.dataset.r) / shrink).toFixed(2));
    });
    svg.querySelectorAll('.airport-label').forEach(label => {
      label.style.fontSize = `${(7.5 / shrink).toFixed(2)}px`;
      const lift = (Number(label.dataset.cy) - Number(label.dataset.y)) / shrink;
      label.setAttribute('y', (Number(label.dataset.cy) - lift).toFixed(2));
    });
  }

  toSvg = (clientX, clientY) => {
    const rect = this.svgRef.current.getBoundingClientRect();
    const view = this.view || this.base;
    return {
      x: view.x + (clientX - rect.left) / rect.width * view.w,
      y: view.y + (clientY - rect.top) / rect.height * view.h
    };
  }

  zoomAt = (clientX, clientY, factor) => {
    const anchor = this.toSvg(clientX, clientY);
    const view = this.view || (this.view = Object.assign({}, this.base));
    view.w *= factor;
    view.h *= factor;
    view.x = anchor.x - (anchor.x - view.x) * factor;
    view.y = anchor.y - (anchor.y - view.y) * factor;
    this.applyView();
  }

  onWheel = (e) => {
    e.preventDefault();
    cancelAnimationFrame(this.anim);
    // proportional to scroll delta: gentle steps on a mouse wheel,
    // near-continuous on a trackpad
    const factor = Math.exp(Math.max(-100, Math.min(100, e.deltaY)) * 0.0009);
    this.zoomAt(e.clientX, e.clientY, factor);
  }

  // reset undoes manual panning, back to the current filter's frame
  onReset = () => {
    this.animateTo(this.fitView());
  }

  onPointerDown = (e) => {
    cancelAnimationFrame(this.anim);
    this.svgRef.current.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const view = this.view || this.base;
      this.pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), w: view.w };
    }
  }

  onPointerMove = (e) => {
    const prev = this.pointers.get(e.pointerId);
    if (!prev) return;
    if (!this.state.panning) this.setState({ panning: true, tooltip: null });
    const view = this.view || (this.view = Object.assign({}, this.base));
    const rect = this.svgRef.current.getBoundingClientRect();
    if (this.pointers.size === 2 && this.pinchStart) {
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (this.pinchStart.dist / dist) * this.pinchStart.w / view.w);
    } else {
      view.x -= (e.clientX - prev.x) / rect.width * view.w;
      view.y -= (e.clientY - prev.y) / rect.height * view.h;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.applyView();
    }
  }

  onPointerUp = (e) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinchStart = null;
    if (!this.pointers.size && this.state.panning) this.setState({ panning: false });
  }

  onHover = (e) => {
    if (this.pointers.size) return;
    const hit = e.target.closest('.hit');
    if (!hit) {
      if (this.state.tooltip) this.setState({ tooltip: null });
      return;
    }
    const rect = this.cardRef.current.getBoundingClientRect();
    this.setState({ tooltip: { label: hit.dataset.label, x: e.clientX - rect.left, y: e.clientY - rect.top } });
  }

  render = () => {
    if (!this.state.airports || !this.state.world || !this.props.flights.length) {
      return null;
    }
    const { routes, visits } = this.mapData();
    if (!routes.length) {
      return null;
    }
    this.base = this.baseView();
    const maxCount = Math.max(...routes.map(route => route.count));
    const maxVisits = Math.max(...visits.map(([, count]) => count));
    const labelled = new Set([...visits].sort((a, b) => b[1] - a[1]).slice(0, 9).map(([code]) => code));
    return (
      <div className='flight-map' ref={this.cardRef}>
        <svg ref={this.svgRef} className={classNames({panning: this.state.panning})}
             viewBox={`${this.base.x} ${this.base.y} ${this.base.w} ${this.base.h}`}
             role='img' aria-label='World map with flight routes'
             onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMove}
             onPointerUp={this.onPointerUp} onPointerCancel={this.onPointerUp}
             onDoubleClick={this.onReset} onMouseMove={this.onHover} onMouseLeave={() => this.setState({tooltip: null})}>
          <path className='land' d={this.state.world.path} />
          {routes.map(route => {
            const arc = this.arcFor(route.a, route.b);
            const t = (route.count - 1) / Math.max(maxCount - 1, 1);
            const style = { strokeOpacity: 0.35 + t * 0.55, strokeWidth: 0.8 + t * 1.2 };
            const label = `${route.a} ⇄ ${route.b} · ${route.count}× · ${formatKm(route.km)}`;
            // arc.wrap adds a copy shifted by one map width, so a route
            // leaving the right edge re-enters on the left
            const offsets = arc.wrap ? [0, arc.wrap] : [0];
            return (
              <g className='route' key={`${route.a}-${route.b}`}>
                {offsets.map(offset => (
                  <g key={offset} transform={offset ? `translate(${offset} 0)` : undefined}>
                    <path className='glow' d={arc.d} />
                    <path className='line' d={arc.d} style={style} />
                    <path className='hit' d={arc.d} data-label={label} />
                  </g>
                ))}
              </g>
            )
          })}
          {visits.map(([code, count]) => {
            const [lat, lon, name] = this.state.airports[code];
            const x = r1(px(lon)), y = r1(py(lat));
            const radius = r1(1.6 + (count / maxVisits) * 2.2);
            const labelY = r1(y - radius - 3.5);
            return (
              <g key={code}>
                <circle className='airport' cx={x} cy={y} r={radius} data-r={radius}>
                  <title>{`${code} · ${name} · ${count}×`}</title>
                </circle>
                {labelled.has(code) && <text className='airport-label' x={x} y={labelY} data-y={labelY} data-cy={y}>{code}</text>}
              </g>
            )
          })}
        </svg>
        <div className='hint'>scroll to zoom · drag to pan · double-click to reset</div>
        {this.state.tooltip && <div className='tooltip' style={{left: this.state.tooltip.x, top: this.state.tooltip.y}}>{this.state.tooltip.label}</div>}
      </div>
    )
  }

}

export default FlightMap;
