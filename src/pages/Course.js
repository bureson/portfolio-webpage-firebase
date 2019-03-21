import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { valueByType } from '../lib/Shared';
import { definition } from '../lib/CourseModel';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';
import Pager from '../components/Pager';
import Search from '../components/Search';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      course: [],
      languageKey: props.match.params.language,
      page: 0,
      perPage: 20,
      loading: true,
      search: ''
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
        loading: true,
        page: 0,
        search: ''
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

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete the item?')) {
      firebase.database().ref(this.state.languageKey).child(key).remove();
    }
  }

  onFilterChange = (e) => {
    e.preventDefault();
    const search = e.target.value;
    this.setState({
      search,
      page: 0
    })
  }

  onPageChange = (e, i) => {
    e.preventDefault();
    this.setState({
      page: i
    });
  }

  filterCourse = () => {
    const courseFields = definition[this.state.languageKey].fields;
    const searchFields = courseFields.filter(({ search }) => search).map(({ key }) => key);
    const search = this.state.search;
    return this.state.course.filter(i => {
      return search ? searchFields.some(key => {
        return i[key].toLowerCase().includes(search.toLowerCase());
      }) : true;
    });
  }

  checkAvailability = (field) => {
    if (field.detail) return false;
    if (field.private && !this.state.authed) return false;
    return true;
  }

  renderCourse = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const firstKey = this.state.page * this.state.perPage;
    const lastKey = firstKey + this.state.perPage;
    const filteredCourse = this.filterCourse();
    const pageContent = filteredCourse.slice(firstKey, lastKey);
    const courseFields = definition[this.state.languageKey].fields;
    const availableCourseFields = courseFields.filter(field => this.checkAvailability(field));
    return (
      <table>
        <thead>
          <tr>
            {availableCourseFields.map(({ key, title }) => {
              return (
                <th key={key}>{title}</th>
              );
            })}
            {this.state.authed && <th>Control</th>}
          </tr>
        </thead>
        <tbody>
          {pageContent.map((item, index) => {
            return (
              <tr key={index}>
                {availableCourseFields.map(({ key, type }) => {
                  return (
                    <td key={key}>{valueByType(item[key], type)}</td>
                  );
                })}
                {this.state.authed && <td><button onClick={(e) => this.onDelete(e, item.key)}><FontAwesomeIcon icon={faTrash} /></button></td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  render = () => {
    if (!definition[this.state.languageKey]) return <NoMatch />;
    const { title, description } = definition[this.state.languageKey];
    const filteredCourse = this.filterCourse();
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
        <p dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(description)}} />
        <div className='page-header'>
          <div className='page-info'>
            List of {this.state.course.length} phrases
          </div>
          <div className='page-controls'>
            <Search value={this.state.search} onChange={this.onFilterChange} />
            {this.state.authed && <Link to={`/course/${this.state.languageKey}/add`}><button>Add new phrase</button></Link>}
            <Link to={`/course/${this.state.languageKey}/practice`}><button>Test yourself</button></Link>
          </div>
        </div>
        {this.renderCourse()}
        <Pager itemsCount={filteredCourse.length} perPage={this.state.perPage} currentPage={this.state.page} onPageChange={this.onPageChange} />
      </div>
    )
  }
}

export default Course;
