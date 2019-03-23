import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import firebase from 'firebase/app';
import { Converter } from 'showdown';

import { definition } from '../lib/CourseModel';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

import AddWord from './AddWord';
import CoursePractice from './CoursePractice';
import CourseTable from './CourseTable';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      course: [],
      languageKey: props.match.params.language,
      loading: true
    }
  }

  componentDidMount = () => {
    document.title = 'Language course | Ondrej Bures';
    this.loadData(this.state.languageKey);
  }

  componentWillUnmount = () => {
    this.courseRef.off();
  }

  componentWillReceiveProps = (props) => {
    const languageKey = props.match.params.language;
    const languageHasChanged = languageKey !== this.state.languageKey;
    this.setState({
      authed: props.authed,
      ...languageHasChanged && {
        course: [],
        languageKey,
        loading: true
      }
    });
    languageHasChanged && this.loadData(languageKey);
  }

  loadData = (languageKey) => {
    this.courseRef = firebase.database().ref(languageKey);
    this.courseRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const course = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        course,
        loading: false
      });
    });
  }

  renderCourse = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const courseProps = {
      authed: this.state.authed,
      course: this.state.course
    };
    return (
      <Switch>
        <Route exact path={'/course/:language'} render={(props) => <CourseTable {...props} {...courseProps} />} />
        <Route exact path={'/course/:language/add'} render={(props) => <AddWord {...props} {...courseProps} />} />
        <Route exact path={'/course/:language/edit/:key'} render={(props) => <AddWord {...props} {...courseProps} />} />
        <Route exact path={'/course/:language/practice'} render={(props) => <CoursePractice {...props} {...courseProps} />} />
      </Switch>
    );
  }

  render = () => {
    if (!definition[this.state.languageKey]) {
      return <NoMatch />;
    }
    const { title } = definition[this.state.languageKey];
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    return (
      <div className='page'>
        <h2 dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(title)}} />
        {this.state.authed && <ul>
          {Object.keys(definition).map(key => {
            return (
              <li key={key}><Link to={`/course/${key}`}>{definition[key].title}</Link></li>
            )
          })}
        </ul>}
        {this.renderCourse()}
      </div>
    )
  }
}

export default Course;
