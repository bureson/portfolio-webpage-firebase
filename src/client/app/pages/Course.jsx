import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

import Pager from '../components/Pager';
import Search from '../components/Search';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false,
      course: [],
      filteredCourse: [],
      page: 0,
      loading: true,
      search: ''
    }
  }

  componentDidMount = () => {
    this.removeListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: !user.isAnonymous,
          user: user.email
        })
      } else {
        this.setState({
          authed: false
        })
      }
    })
    this.courseRef = firebase.database().ref("course");
    this.courseRef.on('value', snapshot => {
      const payload = snapshot.val();
      const course = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => payload[key]);
      this.setState({
        course,
        filteredCourse: course.filter(i => i.original.includes(this.state.search)),
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.courseRef.off();
    this.removeListener();
  }

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  onDelete = (e, key) => {
    e.preventDefault();
    firebase.database().ref("course").child(key).remove();
  }

  onFilterChange = (e) => {
    e.preventDefault();
    const search = e.target.value;
    this.setState({
      search,
      filteredCourse: this.state.course.filter(i => i.original.includes(search))
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
      return <div>Loading ...</div>
    }
    const firstKey = this.state.page * 10;
    const lastKey = firstKey + 10;
    const pageContent = this.state.filteredCourse.slice(firstKey, lastKey);
    return (
      <table className={'table table-striped'}>
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
                  <a href="#" onClick={(e) => this.onDelete(e, key)}><i className={'fa fa-trash'}></i></a>
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
      <DocumentTitle title='Course'>
        <div>
          <h2>Language course by Ian @ Triggerz</h2>
          <div className={'panel panel-default margin-top'}>
            <div className={'panel-heading'}>List of {this.state.filteredCourse.length} phrases</div>
            <div className={'panel-body'}>
              <Search value={this.state.search} onChange={this.onFilterChange} />
            </div>
            {this.renderCourse()}
            <Pager itemsCount={this.state.filteredCourse.length} perPage={10} currentPage={this.state.page} onPageChange={this.onPageChange} />
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default Course;
