import React, { Component } from 'react';
import firebase from 'firebase/app';

import { definition } from '../lib/CourseModel';
import Dropdown from '../components/Dropdown';
import NoMatch from '../components/NoMatch';
import { defaultByType } from '../lib/Shared';

class AddWord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      languageKey: props.match.params.language
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  onKeyUp = (e, key) => {
    if (e.ctrlKey && e.altKey) {
      switch (e.keyCode) {
        case 65: // Note: A
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key] || ''}å`
          });
          break;
        case 69: // Note: E
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key] || ''}æ`
          });
          break;
        case 79: // Note: O
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key] || ''}ø`
          });
          break;
        default:
          break;
      }
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    const courseRef = firebase.database().ref(this.state.languageKey);
    const courseFields = definition[this.state.languageKey].fields;
    const item = Object.keys(courseFields).reduce((obj, key) => {
      const { type } = courseFields[key];
      return {
        ...obj,
        [key]: this.state[key] || defaultByType(type)
      };
    }, {});
    courseRef.push(item, error => {
      if (error) {
        console.log(error);
      } else {
        this.props.history.push(`/course/${this.state.languageKey}`);
      }
    });
  }

  render = () => {
    if (!this.state.authed) {
      return <NoMatch />
    }
    const courseFields = definition[this.state.languageKey].fields;
    const availableCourseFields = Object.keys(courseFields).filter(key => !courseFields[key].private);
    return (
      <div className='add-phrase'>
        <h2>Add new phrase</h2>
        <form onSubmit={e => this.onSubmit(e)}>
          {availableCourseFields.map(key => {
            const { title, type, options } = courseFields[key];
            const value = this.state[key] || '';
            return (
              <div className='input-group' key={key}>
                <label htmlFor={key}>{title}</label>
                {(() => {
                  switch (type) {
                    case 'options':
                      const select = (option) => this.onChange({ target: { value: option.key } }, key);
                      const selected = value || 'Choose one ...';
                      return (
                        <Dropdown selected={selected} optionList={options} select={select} />
                      );
                    case 'text':
                      return (
                        <textarea value={value} onChange={e => this.onChange(e, key)} rows={5} />
                      );
                    case 'string':
                    default:
                      return (
                        <input type='text' id={key} value={value} onChange={e => this.onChange(e, key)} onKeyUp={e => this.onKeyUp(e, key)} />
                      );
                  }
                })()}
              </div>
            );
          })}
          <button type='submit' value='Submit'>Submit</button>
        </form>
        <div className='tooltip'>
          <h3>Special characters</h3>
          <ul>
            <li>å (Ctrl + Alt + A)</li>
            <li>æ (Ctrl + Alt + E)</li>
            <li>ø (Ctrl + Alt + O)</li>
            <li>ö</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default AddWord;
