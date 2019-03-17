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
    this.courseRef = firebase.database().ref(this.state.languageKey);
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
    const searchFields = Object.keys(courseFields).filter(field => courseFields[field].search);
    const search = this.state.search;
    return this.state.course.filter(i => {
      return search ? searchFields.some(key => {
        return i[key].toLowerCase().includes(search.toLowerCase());
      }) : true;
    });
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
    const availableCourseFields = Object.keys(courseFields).filter(key => this.state.authed || !courseFields[key].private);
    return (
      <table>
        <thead>
          <tr>
            {availableCourseFields.map(key => {
              const field = courseFields[key];
              return (
                <th key={key}>{field.title}</th>
              );
            })}
            {this.state.authed && <th>Control</th>}
          </tr>
        </thead>
        <tbody>
          {pageContent.map((item, index) => {
            return (
              <tr key={index}>
                {availableCourseFields.map(key => {
                  const { type } = courseFields[key];
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
        <p dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(description)}} />
        <div className='page-header'>
          <div className='page-info'>
            List of {this.state.course.length} phrases
          </div>
          <div className='page-controls'>
            <Search value={this.state.search} onChange={this.onFilterChange} />
            {this.state.authed && <Link to={`/course/${this.state.languageKey}/add`}><button>Add new phrase</button></Link>}
          </div>
        </div>
        {this.renderCourse()}
        <Pager itemsCount={filteredCourse.length} perPage={this.state.perPage} currentPage={this.state.page} onPageChange={this.onPageChange} />
      </div>
    )
  }
}

export default Course;
