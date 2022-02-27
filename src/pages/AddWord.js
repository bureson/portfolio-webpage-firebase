import React, { Component } from 'react';
import { getDatabase, ref, set, push, child } from 'firebase/database';

import { definition } from '../lib/CourseModel';
import Dropdown from '../components/Dropdown';
import NoMatch from '../components/NoMatch';
import { defaultByType, similarity } from '../lib/Shared';

class AddWord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      languageKey: props.match.params.language,
      wordKey: props.match.params.key
    }
  }

  componentDidMount = () => {
    if (this.state.wordKey) {
      const word = this.props.course.find(item => item.key === this.state.wordKey);
      this.setState(word);
    }
    // Note: recaptcha code below if I ever decide to allow users post new words
    // Remember to add <div id='recaptcha-container' /> to component's body
    // if (!this.state.authed) {
    //   window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    //     size: 'normal',
    //     callback: (response) => console.log(response)
    //   });
    //   window.recaptchaVerifier.render().then(widgetId => window.recaptchaWidgetId = widgetId);
    // }
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  onChange = (e, key) => {
    const { value } = e.target;
    const { fields } = definition[this.state.languageKey];
    const { search } = fields.find(f => f.key === key);
    const similarWordList = search ? this.props.course.reduce((acc, item) => {
      const sim = similarity(item[key], value);
      const thisWord = item.key === this.state.wordKey;
      const shouldAdd = !thisWord && sim > 0.65;
      return shouldAdd ? [...acc, item[key]] : acc;
    }, []) : [];
    this.setState({
      [key]: e.target.value,
      [`${key}Sim`]: similarWordList
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
    const { fields } = definition[this.state.languageKey];
    const item = fields.reduce((obj, { key, type }) => {
      return {
        ...obj,
        [key]: this.state[key] || defaultByType(type)
      };
    }, {});
    const db = getDatabase();
    const wordKey = this.state.wordKey || push(child(ref(db), this.state.languageKey)).key;
    set(ref(db, `${this.state.languageKey}/${wordKey}`), item).then(() => {
      this.props.history.push(`/course/${this.state.languageKey}`);
    }).catch(console.log);
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
            const keySim = this.state[`${key}Sim`];
            const hasSim = keySim && keySim.length;
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
                        <span>
                          <input type='text' id={key} value={value} onChange={e => this.onChange(e, key)} onKeyUp={e => this.onKeyUp(e, key)} />
                          {!!hasSim && <p className='did-you-mean'>Did you mean: {keySim.join(', ')}</p>}
                        </span>
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
