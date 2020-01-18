import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import firebase from 'firebase/app';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

import { convertTimestamp, sortBy } from '../lib/Shared';
import Dropdown from '../components/Dropdown';
import Loader from '../components/Loader';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      countryList: [],
      display: 'map',
      filterYear: null,
      loading: true,
      sortBy: 'date',
      sortDirection: 'desc'
    }
  }

  componentDidMount = () => {
    document.title = 'Countries | Ondrej Bures';
    this.countryRef = firebase.database().ref('country');
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      const lastYear = new Date(countryList[0].date * 1000).getFullYear();
      const firstYear = new Date(countryList[countryList.length - 1].date * 1000).getFullYear();
      const data = [...Array(lastYear - firstYear + 1).keys()].map((_, key) => {
        const year = firstYear + key;
        const count = countryList.filter(c => new Date(c.date * 1000).getFullYear() === year).length;
        return {year, count};
      }).reduce((acc, val, key, array) => {
        const {count} = val;
        const holder = {year: '...', count: 0};
        const isEmpty = count === 0;
        const prevIsHolder = isEmpty && acc[acc.length - 1].year === '...';
        const nextIsEmpty = isEmpty && [1, 2].every(inc => array[key + inc] && array[key + inc].count === 0);
        return isEmpty
        ? prevIsHolder
          ? acc
          : nextIsEmpty
            ? acc.concat(holder)
            : acc.concat(val)
        : acc.concat(val);
      }, []);
      this.setState({
        countryList,
        data: data,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.countryRef.off();
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
    firebase.database().ref('country').child(key).remove();
  }

  onDotClick = (e) => {
    const filterYear = e
      ? e.activeLabel === this.state.filterYear
        ? null
        : e.activeLabel
      : null;
    this.setState({
      filterYear
    });
  }

  clearFilter = (e) => {
    this.setState({
      filterYear: null
    });
  }

  selectDisplay = ({ key }) => {
    this.setState({
      display: key
    });
  }

  selectSorter = ({ key, direction }) => {
    this.setState({
      sortBy: key,
      sortDirection: direction
    });
  }

  renderChart () {
    return (
      <ResponsiveContainer height={200}>
        <LineChart data={this.state.data} margin={{top: 20, right: 20, left: 20, bottom: 20}} onClick={this.onDotClick}>
          <XAxis dataKey='year'/>
          <Tooltip/>
          <Line type='monotone' dataKey='count' stroke='#2c73b0' activeDot={{r: 8}}/>
        </LineChart>
      </ResponsiveContainer>
    )
  }

  renderMap () {
    setTimeout(() => this.loadMap(), 50);
    return (
      <div id='chartdiv'></div>
    )
  }

  loadMap () {
    // Note: inspired by example at: https://www.amcharts.com/demos/grouped-countries-map/
    const chart = am4core.create('chartdiv', am4maps.MapChart);
    chart.geodata = am4geodata_worldHigh;
    chart.projection = new am4maps.projections.NaturalEarth1();
    chart.zoomControl = new am4maps.ZoomControl();

    chart.panEventsEnabled = false;
    chart.homeZoomLevel = 1.12;
    // chart.minZoomLevel = 1.12;
    // chart.maxZoomLevel = 1.12;
    chart.homeGeoPoint = {
      latitude: 20,
      longitude: 0
    };

    const homeButton = new am4core.Button();
    homeButton.events.on('hit', () => chart.goHome());

    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);

    const groupData = Object.values(this.state.countryList.reduce((data, country) => {
      const year = new Date(country.date * 1000).getFullYear();
      const countryList = data[year] ? data[year].data : [];
      if (!country.iso) console.log(country);
      return { ...data, [year]: { data: [...countryList, { id: country.iso, title: country.name, customData: year.toString() }] } };
    }, {}));

    // This array will be populated with country IDs to exclude from the world series
    const excludedCountries = [];

    // Create a series for each group, and populate the above array
    groupData.forEach(group => {
      const series = chart.series.push(new am4maps.MapPolygonSeries());
      series.name = group.name;
      series.useGeodata = true;
      const includedCountries = [];
      group.data.forEach(country => {
        includedCountries.push(country.id);
        excludedCountries.push(country.id);
      });
      series.include = includedCountries;

      series.fill = am4core.color('#2c73b0');
      series.setStateOnChildren = true;
      series.calculateVisualCenter = true;

      const mapPolygonTemplate = series.mapPolygons.template;
      mapPolygonTemplate.fill = am4core.color('#2c73b0');
      mapPolygonTemplate.fillOpacity = 0.8;
      mapPolygonTemplate.nonScalingStroke = true;
      mapPolygonTemplate.tooltipPosition = 'fixed'

      mapPolygonTemplate.events.on('over', event => {
        series.mapPolygons.each(mapPolygon => {
          mapPolygon.isHover = true;
        });
        event.target.isHover = false;
        event.target.isHover = true;
      });

      mapPolygonTemplate.events.on('out', event => {
        series.mapPolygons.each(mapPolygon => {
          mapPolygon.isHover = false;
        })
      });

      const hoverState = mapPolygonTemplate.states.create('hover');
      hoverState.properties.fill = am4core.color('#30628e');

      mapPolygonTemplate.tooltipText = 'Visited {title} in {customData}';
      series.data = JSON.parse(JSON.stringify(group.data));
    });

    // The rest of the world.
    const worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
    const worldSeriesName = 'world';
    worldSeries.name = worldSeriesName;
    worldSeries.useGeodata = true;
    worldSeries.exclude = excludedCountries;
    worldSeries.fillOpacity = 0.8;
    worldSeries.hiddenInLegend = true;
    worldSeries.mapPolygons.template.nonScalingStroke = true;
  }

  renderCountries = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const filteredCountryList = this.state.filterYear
      ? this.state.countryList.filter(c => new Date(c.date * 1000).getFullYear() === this.state.filterYear)
      : this.state.countryList;
    const sortedCountryList = filteredCountryList.sort(sortBy(this.state.sortBy, this.state.sortDirection));
    return (
      <div className='countries-list'>
        {this.state.display === 'map' ? this.renderMap() : this.renderChart()}
        {sortedCountryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
                <div className='content'>
                  <h3>{country.name}</h3>
                  <small>{convertTimestamp(country.date)}</small>
                  <p>{country.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  render = () => {
    return (
      <div className='page'>
        <h2>Countries log</h2>
        <div className='page-header'>
          <div className='page-info'>
            <p>{this.state.countryList.length} countries visited</p>
          </div>
          <div className='page-controls'>
            {this.state.filterYear && <button onClick={this.clearFilter}>Clear filter: {this.state.filterYear}</button>}
            <Dropdown selected={`Shown on ${this.state.display}`} optionList={[{ key: 'map' }, { key: 'chart' }]} select={this.selectDisplay} />
            <Dropdown selected={`Sorted by ${this.state.sortBy}`} optionList={[{ key: 'date', direction: 'desc' }, { key: 'name', dirrection: 'asc' }]} select={this.selectSorter} />
            {this.state.authed && <Link to={'/countries/add'}><button>Add new country</button></Link>}
          </div>
        </div>
        {this.renderCountries()}
      </div>
    )
  }
}

export default Countries;
