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
    const { specialKeys } = definition[this.state.languageKey];
    if (e.ctrlKey && e.altKey && specialKeys[e.key]) {
      e.preventDefault();
      const state = this.state[key] || '';
      const specialKey = specialKeys[e.key];
      this.setState({
        [key]: state + specialKey
      });
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    const courseRef = firebase.database().ref(this.state.languageKey);
    const courseFields = definition[this.state.languageKey].fields;
    const item = courseFields.reduce((obj, { key, type }) => {
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
    const { fields, specialKeys } = definition[this.state.languageKey];
    const availableCourseFields = fields.filter((field) => !field.private);
    return (
      <div className='add-phrase'>
        <h3>Add new phrase</h3>
        <form onSubmit={e => this.onSubmit(e)}>
          {availableCourseFields.map(({ key, title, type, options }) => {
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
        {specialKeys && <div className='tooltip'>
          <h3>Special characters</h3>
          <ul>
            {Object.keys(specialKeys).map(key => {
              return (
                <li key={key}>{`${specialKeys[key]} (Ctrl + Alt + ${key.toUpperCase()})`}</li>
              );
            })}
          </ul>
        </div>}
      </div>
    )
  }
}

export default AddWord;
