import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

import Pager from '../components/Pager';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false,
      course: [],
      page: 0,
      loading: true
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
      // const items = [];
      const tempItems = snapshot.val();
      const items = Object.keys(tempItems)
            .sort(function(a, b) {return tempItems[b].timestamp - tempItems[a].timestamp})
            .map(function(key) {return tempItems[key]}); // items[key] = tempItems[key]
      this.setState({
        course: items,
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
    const pageContent = this.state.course.slice(firstKey, lastKey);
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
            <div className={'panel-heading'}>List of {this.state.course.length} phrases</div>
            <div className={'panel-body'}><p>This is temporary panel body</p></div>
            {this.renderCourse()}
            <Pager itemsCount={this.state.course.length} perPage={10} currentPage={this.state.page} onPageChange={(e, i) => this.onPageChange(e, i)} />
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default Course;
