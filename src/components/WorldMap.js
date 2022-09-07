import React, { Component } from 'react';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

class WorldMap extends Component {
  load () {
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

    const groupData = Object.values(this.props.countryList.reduce((data, country) => {
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

      series.fill = am4core.color('#f72fd9');
      series.setStateOnChildren = true;
      series.calculateVisualCenter = true;

      const mapPolygonTemplate = series.mapPolygons.template;
      mapPolygonTemplate.fill = am4core.color('#f72fd9');
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
      hoverState.properties.fill = am4core.color('#f72fd9');

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

  render () {
    setTimeout(() => this.load(), 50);
    return (
      <div id='chartdiv'></div>
    )
  }
}

export default WorldMap;
