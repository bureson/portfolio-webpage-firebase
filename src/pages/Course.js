import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
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

  componentDidUpdate = () => {
    const languageKey = this.props.match.params.language;
    const languageHasChanged = languageKey !== this.state.languageKey;
    if (this.state.authed !== this.props.authed || languageHasChanged) {
      this.setState({
        authed: this.props.authed,
        ...languageHasChanged && {
          course: [],
          languageKey,
          loading: true
        }
      });
      languageHasChanged && this.loadData(languageKey);
    }
  }

  loadData = (languageKey) => {
    const db = getDatabase();
    const courseRef = ref(db, languageKey);
    onValue(courseRef, snapshot => {
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
        <div className='course-nav'>
        {Object.keys(definition).map(key => {
            const courseDef = definition[key];
            return (
                <Link to={`/course/${key}`}><div className={courseDef.countryIso}></div></Link>
            );
        })}
        </div>
        <h2 dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(title)}} />
        {this.renderCourse()}
      </div>
    )
  }
}

export default Course;
