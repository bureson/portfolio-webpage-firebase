import React, { Component } from 'react';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false,
      course: [],
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
      const tempItems = snapshot.val();
      const items = Object.keys(tempItems)
                          .sort(function(a, b) {return tempItems[b].timestamp - tempItems[a].timestamp})
                          .map(function(key) {return tempItems[key]});
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

  renderCourse = () => {
    let item;
    if (this.state.loading) {
      return <div>Loading ...</div>
    }
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
          {this.state.course && Object.keys(this.state.course).map((key, index) => {
            item = this.state.course[key];
            return (
              <tr key={index}>
                <td>{item.original}</td>
                <td>{item.prons}</td>
                <td>{item.means}</td>
                {this.state.authed && <td>
                  <i className={'fa fa-calendar'} title={this.convertTimestamp(item.timestamp)}></i>
                  {' '}
                  <a href="#" onClick={(e) => this.onDelete(e, key)}><i className={'fa fa-trash-o'}></i></a>
                </td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  render() {
    return (
      <div className={'panel panel-default margin-top'}>
        <div className={'panel-heading'}>List of {this.state.course && Object.keys(this.state.course).length} phrases</div>
        <div className={'panel-body'}><p>This is temporary panel body</p></div>
        {this.renderCourse()}
      </div>
    )
  }
}

export default Course;
