import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

import { convertTimestamp, randomNumber, readingTime } from '../lib/Shared';
import Loader from '../components/Loader';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      blog: [],
      countryList: [],
      loadingBlog: true,
      loadingCountries: true,
      loadingCourse: true,
      word: null
    }
  }

  componentDidMount = () => {
    document.title = 'Portfolio | Ondrej Bures';
    const db = getDatabase();
    onValue(ref(db, 'danish'), snapshot => {
      const payload = snapshot.val() || {};
      const keyList = Object.keys(payload);
      const key = keyList[randomNumber(keyList.length)];
      this.setState({
        word: key && payload[key],
        loadingCourse: false
      });
    });
    onValue(ref(db, 'country'), snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        countryList,
        loadingCountries: false
      });
    });
    onValue(ref(db, 'blog'), snapshot => {
      const payload = snapshot.val() || {};
      const blog = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]))
            .filter(post => post.public);
      this.setState({
        blog,
        loadingBlog: false
      });
    });
  }

  renderWord = () => {
    if (this.state.loadingCourse) {
      return <Loader />
    }
    const word = this.state.word;
    if (!word) return null;
    return (
      <React.Fragment>
        <div className='word'>{word.original}</div>
        {word.prons && <div className='meta'>[{word.prons}]</div>}
        <p>{word.means}</p>
      </React.Fragment>
    )
  }

  renderCountries = () => {
    if (this.state.loadingCountries) {
      return <Loader />
    }
    return (
      <div className='country-grid'>
        {this.state.countryList.slice(0, 2).map(country => {
          return (
            <Link className='row-link' to={`/countries/${country.key}`} key={country.key}>
              <div className='country-tile'>
                <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
                <div className='title'>{country.name}</div>
                <div className='meta'>{convertTimestamp(country.date)}</div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  renderPosts = () => {
    if (this.state.loadingBlog) {
      return <Loader />
    }
    return this.state.blog.slice(0, 2).map(post => {
      return (
        <Link className='row-link' to={`/blog/${post.key}`} key={post.key}>
          <div className='post'>
            <div className='title'>{post.title}</div>
            <div className='meta'>{convertTimestamp(post.timestamp)} · ~{readingTime(post.body)} min read</div>
          </div>
        </Link>
      )
    })
  }

  render = () => {
    return (
      <div className='page home'>
        <div className='home-hero'>
          <p className='kicker'>Prague, Czech Republic · Full-stack developer</p>
          <h1>I build software, collect countries, and write a blog about it.</h1>
          <p className='lede'>
            Back home after three years in Copenhagen, still working the four-day week
            at <a href='https://www.culturedrivers.com/' target='_blank' rel='noopener noreferrer'>CultureDrivers</a>.
            This site is where my side collections live.
          </p>
        </div>
        <div className='home-cards'>
          <div className='home-card'>
            <p className='kicker'>Word of the day</p>
            {this.renderWord()}
            <Link className='more' to='/course'>One word every workday since June 2017 →</Link>
          </div>
          <div className='home-card'>
            <p className='kicker'>{this.state.loadingCountries ? 'Countries' : `Countries (${this.state.countryList.length})`}</p>
            {this.renderCountries()}
            {/* <p>A homemade tracker of every country I've set foot in — built during a long Scandinavian night.</p> */}
            <Link className='more' to='/countries'>See the full map →</Link>
          </div>
          <div className='home-card'>
            <p className='kicker'>{this.state.loadingBlog ? 'Blog' : `Blog (${this.state.blog.length})`}</p>
            {this.renderPosts()}
            <Link className='more' to='/blog'>All posts →</Link>
          </div>
        </div>
      </div>
    )
  }
}

export default Home;
