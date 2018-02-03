import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: [],
      loading: true
    }
  }

  componentDidMount = () => {
    this.countryRef = firebase.database().ref("country");
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const country = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        country,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.countryRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  onDelete = (e, key) => {
    e.preventDefault();
    firebase.database().ref("country").child(key).remove();
  }

  render = () => {
    return (
      <DocumentTitle title='Countries'>
        <div>
          <h2>Countries log</h2>
          {this.state.authed && <Link to={'/add-country'}><button className={'btn btn-default pull-right'}>Add new country</button></Link>}
          <p>{this.state.country.length} countries visited</p>
          {this.state.country.map((country, index) => {
            return (
              <div key={index}>
                <p>{country.name} <a href='#' onClick={e => this.onDelete(e, country.key)}>Remove</a></p>
                <p>{country.date}</p>
                <img src={`${country.photoPath}`} width='500px' />
                <p>{country.description}</p>
              </div>
            )
          })}
        </div>
      </DocumentTitle>
    )
  }
}

export default Course;
