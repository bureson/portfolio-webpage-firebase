import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { definition } from '../lib/CourseModel';
import Pager from '../components/Pager';
import Search from '../components/Search';
import { valueByType } from '../lib/Shared';

class CourseTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      languageKey: props.match.params.language,
      page: 0,
      perPage: 20,
      search: ''
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed,
      languageKey: props.match.params.language
    })
  }

  filterCourse = () => {
    const courseFields = definition[this.state.languageKey].fields;
    const searchFields = courseFields.filter(({ search }) => search).map(({ key }) => key);
    const search = this.state.search;
    return this.props.course.filter(i => {
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

  onPageChange = (e, i) => {
    e.preventDefault();
    this.setState({
      page: i
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

  render = () => {
    const firstKey = this.state.page * this.state.perPage;
    const lastKey = firstKey + this.state.perPage;
    const filteredCourse = this.filterCourse();
    const pageContent = filteredCourse.slice(firstKey, lastKey);
    const courseFields = definition[this.state.languageKey].fields;
    const availableCourseFields = courseFields.filter(field => this.checkAvailability(field));
    const { description } = definition[this.state.languageKey];
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    return (
      <div>
        <p dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(description)}} />
        <div className='page-header'>
          <div className='page-info'>
            List of {this.props.course.length} phrases
          </div>
          <div className='page-controls'>
            <Search value={this.state.search} onChange={this.onFilterChange} />
            {this.state.authed && <Link to={`/course/${this.state.languageKey}/add`}><button>Add new phrase</button></Link>}
            <Link to={`/course/${this.state.languageKey}/practice`}><button>Test yourself</button></Link>
          </div>
        </div>
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
                  {this.state.authed && <td className='control'>
                    <Link to={`/course/${this.state.languageKey}/edit/${item.key}`} className='button'><FontAwesomeIcon icon={faEdit} /></Link>
                    <button onClick={(e) => this.onDelete(e, item.key)}><FontAwesomeIcon icon={faTrash} /></button>
                  </td>}
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pager itemsCount={filteredCourse.length} perPage={this.state.perPage} currentPage={this.state.page} onPageChange={this.onPageChange} />
      </div>
    )
  }
}

export default CourseTable;
