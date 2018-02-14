import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

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
    this.courseRef = firebase.database().ref('course');
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

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete the item?')) {
      firebase.database().ref('course').child(key).remove();
    }
  }

  onFilterChange = (e) => {
    e.preventDefault();
    const search = e.target.value;
    this.setState({
      search,
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
            {this.state.authed && <th>Functions</th>}
          </tr>
        </thead>
        <tbody>
          {pageContent.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item.original}</td>
                <td>{item.prons}</td>
                <td>{item.means}</td>
                {this.state.authed && <td>
                  <i className={'fa fa-calendar'} title={this.convertTimestamp(item.timestamp)}></i>
                  {' '}
                  <button onClick={(e) => this.onDelete(e, item.key)}><i className={'fa fa-trash'}></i></button>
                </td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  render = () => {
    return (
      <div className='course'>
        <h2>Language course by Ian @ Triggerz</h2>
        <div className='course-header'>
          <div className='course-info'>
            List of {this.state.filteredCourse.length} phrases
          </div>
          <div className='course-controls'>
            <Search value={this.state.search} onChange={this.onFilterChange} />
            {this.state.authed && <Link to={'/add-phrase'}><button>Add new phrase</button></Link>}
          </div>
        </div>
        {this.renderCourse()}
        <Pager itemsCount={this.state.filteredCourse.length} perPage={this.state.perPage} currentPage={this.state.page} onPageChange={this.onPageChange} />
      </div>
    )
  }
}

export default Course;
