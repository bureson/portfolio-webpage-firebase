import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';

import { convertTimestamp } from '../components/Library';
import Loader from '../components/Loader';
import Pager from '../components/Pager';
import Search from '../components/Search';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      course: [],
      filteredCourse: [],
      page: 0,
      perPage: 20,
      loading: true,
      search: ''
    }
  }

  componentDidMount = () => {
    document.title = 'Language course | Ondrej Bures';
    this.courseRef = firebase.database().ref('danish');
    this.courseRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const course = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        course,
        filteredCourse: course.filter(i => i.original.includes(this.state.search)),
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.courseRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete the item?')) {
      firebase.database().ref('danish').child(key).remove();
    }
  }

  onFilterChange = (e) => {
    e.preventDefault();
    const search = e.target.value;
    this.setState({
      search,
      page: 0,
      filteredCourse: this.state.course.filter(i => ['original', 'means'].some(key => i[key].toLowerCase().includes(search.toLowerCase())))
    })
  }

  onPageChange = (e, i) => {
    e.preventDefault();
    this.setState({
      page: i
    });
  }

  renderCourse = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const firstKey = this.state.page * this.state.perPage;
    const lastKey = firstKey + this.state.perPage;
    const pageContent = this.state.filteredCourse.slice(firstKey, lastKey);
    return (
      <table>
        <thead>
          <tr>
            <th>Original</th>
            <th>Pronunciation</th>
            <th>Translation</th>
            {this.state.authed && <th>Added</th>}
            {this.state.authed && <th>Control</th>}
          </tr>
        </thead>
        <tbody>
          {pageContent.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item.original}</td>
                <td>{item.prons}</td>
                <td>{item.means}</td>
                {this.state.authed && <td>{convertTimestamp(item.timestamp, 'dd:mm:yyyy')}</td>}
                {this.state.authed && <td><button onClick={(e) => this.onDelete(e, item.key)}><FontAwesomeIcon icon={faTrash} /></button></td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  render = () => {
    return (
      <div className='page'>
        <h2>Language course by Ian @ Triggerz</h2>
        <p>
          After running the <em>Word of the day</em> for more than a year, on the 25th of July 2018 we decided that it would be nice to round up the challenge at the number 300.
          Since then we have managed to come up with a couple of good words that are worth noting down here and we might occasionally do so in the future, but
          we consider this initiative to be finished. A giant thanks belongs to my colleague <a href='http://ianvictor.dk/' target='_blank' rel='noopener noreferrer'>Ian Abildskou</a>,
          because this brought us, but not only us a lot of fun.
        </p>
        <div className='page-header'>
          <div className='page-info'>
            List of {this.state.course.length} phrases
          </div>
          <div className='page-controls'>
            <Search value={this.state.search} onChange={this.onFilterChange} />
            {this.state.authed && <Link to={'/course/add'}><button>Add new phrase</button></Link>}
          </div>
        </div>
        {this.renderCourse()}
        <Pager itemsCount={this.state.filteredCourse.length} perPage={this.state.perPage} currentPage={this.state.page} onPageChange={this.onPageChange} />
      </div>
    )
  }
}

export default Course;
