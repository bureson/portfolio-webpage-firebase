import React, { Component } from 'react';
import { getDatabase, ref, set, push, child } from 'firebase/database';

import Dialog from './Dialog';
import { definition } from '../lib/CourseModel';
import { classNames, defaultByType, similarity } from '../lib/Shared';

class PhraseDialog extends Component {

  constructor(props) {
    super(props);
    const word = props.word || {};
    const { fields } = definition[props.languageKey];
    this.state = fields.reduce((state, { key }) => {
      return {
        ...state,
        [key]: word[key] || ''
      };
    }, {
      focusedKey: null
    });
  }

  onChange = (e, key) => {
    const { value } = e.target;
    const { fields } = definition[this.props.languageKey];
    const { search } = fields.find(f => f.key === key);
    const similarWordList = search ? this.props.course.reduce((acc, item) => {
      const sim = similarity(item[key], value);
      const thisWord = this.props.word && item.key === this.props.word.key;
      const shouldAdd = !thisWord && sim > 0.65;
      return shouldAdd ? [...acc, item[key]] : acc;
    }, []) : [];
    this.setState({
      [key]: value,
      [`${key}Sim`]: similarWordList
    });
  }

  onKeyUp = (e, key) => {
    const { specialKeys } = definition[this.props.languageKey];
    if (e.ctrlKey && e.altKey && specialKeys && specialKeys[e.key]) {
      e.preventDefault();
      const state = this.state[key] || '';
      this.setState({
        [key]: state + specialKeys[e.key]
      });
    }
  }

  insertChar = (char) => {
    const { fields } = definition[this.props.languageKey];
    const key = this.state.focusedKey || fields[0].key;
    this.setState(state => ({
      [key]: (state[key] || '') + char
    }));
  }

  onSubmit = () => {
    const { fields } = definition[this.props.languageKey];
    const item = fields.reduce((obj, { key, type }) => {
      return {
        ...obj,
        [key]: this.state[key] || defaultByType(type)
      };
    }, {});
    const db = getDatabase();
    const wordKey = (this.props.word && this.props.word.key) || push(child(ref(db), this.props.languageKey)).key;
    set(ref(db, `${this.props.languageKey}/${wordKey}`), item)
      .then(() => this.props.onClose())
      .catch(console.log);
  }

  renderField = ({ key, title, type, options }) => {
    const value = this.state[key] || '';
    const keySim = this.state[`${key}Sim`];
    switch (type) {
      case 'options':
        return (
          <div className='field' key={key}>
            <label>{title}</label>
            <div className='type-chips'>
              {options.map(option => (
                <button key={option.key} className={classNames('chip', {selected: value === option.key})} onClick={() => this.onChange({ target: { value: option.key } }, key)}>{option.title}</button>
              ))}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className='field' key={key}>
            <label>{title}</label>
            <textarea rows='5' value={value} onChange={e => this.onChange(e, key)} onFocus={() => this.setState({focusedKey: key})} />
          </div>
        );
      case 'string':
      default:
        return (
          <div className='field' key={key}>
            <label>{title}</label>
            <input value={value} onChange={e => this.onChange(e, key)} onKeyUp={e => this.onKeyUp(e, key)} onFocus={() => this.setState({focusedKey: key})} />
            {!!(keySim && keySim.length) && <p className='did-you-mean'>Did you mean: {keySim.join(', ')}</p>}
          </div>
        );
    }
  }

  render = () => {
    const { fields, specialKeys, nativeName } = definition[this.props.languageKey];
    const availableFields = fields.filter(field => !field.private);
    // pair up adjacent string fields so short inputs share a row
    const rows = availableFields.reduce((rows, field) => {
      const last = rows[rows.length - 1];
      if (field.type === 'string' && last && last.length === 1 && last[0].type === 'string') {
        last.push(field);
      } else {
        rows.push([field]);
      }
      return rows;
    }, []);
    return (
      <Dialog kicker={`Language course · ${nativeName}`} title={this.props.word ? 'Edit phrase' : 'Add a phrase'} onClose={this.props.onClose}>
        <div className='dialog-body'>
          {rows.map((row, index) => {
            if (row.length === 1) {
              return this.renderField(row[0]);
            }
            return (
              <div className='field-grid phrase-row' key={index}>
                {row.map(field => this.renderField(field))}
              </div>
            );
          })}
          {specialKeys && <div className='field'>
            <label>Special characters</label>
            <div className='type-chips special-chars'>
              {Object.keys(specialKeys).map(key => (
                <button
                  key={key}
                  className='chip'
                  title={`Ctrl + Alt + ${key.toUpperCase()}`}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => this.insertChar(specialKeys[key])}
                >{specialKeys[key]}</button>
              ))}
            </div>
          </div>}
        </div>
        <div className='dialog-foot'>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!this.state[fields[0].key]} onClick={this.onSubmit}>Save phrase</button>
        </div>
      </Dialog>
    )
  }

}

export default PhraseDialog;
