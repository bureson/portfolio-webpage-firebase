import React, { Component } from 'react';
import firebase from 'firebase/app';

import { randomNumber, shuffle } from '../lib/Shared';
import Loader from '../components/Loader';

class Practice extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      correctCount: 0,
      languageKey: props.match.params.language,
      loading: true,
      optionKeyList: [],
      practice: [],
      questionKey: 0,
      selectedKey: null,
      totalCount: 0
    }
  }

  componentDidMount = () => {
    document.title = 'Language practice | Ondrej Bures';
    this.practiceRef = firebase.database().ref(this.state.languageKey);
    this.practiceRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const practice = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      const { questionKey, optionList } = this.generateQuestion(practice);
      this.setState({
        loading: false,
        optionList,
        practice,
        questionKey
      });
    });
  }

  componentWillUnmount = () => {
    this.practiceRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  generateQuestion = (practice) => {
    const questionKey = randomNumber(practice.length - 1);
    const question = practice[questionKey];
    const optionKeyList = [...Array(3).keys()].map(_ => randomNumber(practice.length - 1));
    const optionList = shuffle([{ key: question.key, title: question.means, correct: true }, ...optionKeyList.map(key => {
      const wrong = practice[key];
      return { key: wrong.key, title: wrong.means };
    })]);
    return { questionKey, optionList };
  }

  goToNext = () => {
    const { questionKey, optionList } = this.generateQuestion(this.state.practice);
    this.setState({
      questionKey,
      optionList,
      selectedKey: null
    });
  }

  selectItem = (item) => {
    !this.state.selectedKey && this.setState({
      correctCount: item.correct ? this.state.correctCount + 1 : this.state.correctCount,
      selectedKey: item.key,
      totalCount: this.state.totalCount + 1
    });
  }

  renderPractice = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const randomItem = this.state.practice[this.state.questionKey];
    const optionList = this.state.optionList;
    return (
      <div className='practice'>
        <p>Choose a correct translation for</p>
        <h3>{randomItem.original}</h3>
        <div className='options'>
          {optionList.map((item, i) => {
            const { key, title } = item;
            const isThisKey = this.state.selectedKey && key === this.state.selectedKey;
            const isCorrectKey = this.state.selectedKey && key === randomItem.key;
            const className = isCorrectKey ? 'correct' : isThisKey ? 'incorrect' : '';
            return (
              <div key={i} className={className} onClick={e => this.selectItem(item)}>{title}</div>
            );
          })}
        </div>
        <p>Your score: {this.state.correctCount} / {this.state.totalCount}</p>
        {this.state.selectedKey && <button onClick={this.goToNext}>Go to next question</button>}
      </div>
    )
  }

  render = () => {
    return (
      <div className='page'>
        <h2>Practice</h2>
        <div className='page-header'>
          <div className='page-info'>

          </div>
          <div className='page-controls'>
          </div>
        </div>
        {this.renderPractice()}
      </div>
    )
  }
}

export default Practice;
