import React, { Component } from 'react';
import firebase from 'firebase/app';

import { definition } from '../lib/CourseModel';
import Loader from '../components/Loader';
import { randomNumber, shuffle } from '../lib/Shared';

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
      const { questionKey, optionKeyList } = this.generateQuestion(practice);
      this.setState({
        loading: false,
        optionKeyList,
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
    const optionKeyList = shuffle([questionKey, ...[...Array(3).keys()].map(_ => randomNumber(practice.length - 1))]);
    return { questionKey, optionKeyList };
  }

  goToNext = () => {
    const { questionKey, optionKeyList } = this.generateQuestion(this.state.practice);
    this.setState({
      questionKey,
      optionKeyList,
      selectedKey: null
    });
  }

  selectAnswer = (selectedKey) => {
    if (!this.state.selectedKey) {
      const isCorrect = selectedKey === this.state.questionKey;
      this.setState({
        correctCount: isCorrect ? this.state.correctCount + 1 : this.state.correctCount,
        selectedKey,
        totalCount: this.state.totalCount + 1
      });
    }
  }

  renderPractice = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const question = this.state.practice[this.state.questionKey];
    return (
      <div className='practice'>
        <p>Choose a correct translation for</p>
        <h3>{question.original}</h3>
        <div className='options'>
          {this.state.optionKeyList.map((optionKey, i) => {
            const { means } = this.state.practice[optionKey];
            const isThisKey = this.state.selectedKey && optionKey === this.state.selectedKey;
            const isCorrectKey = this.state.selectedKey && optionKey === this.state.questionKey;
            const className = isCorrectKey ? 'correct' : isThisKey ? 'incorrect' : '';
            return (
              <div key={i} className={className} onClick={e => this.selectAnswer(optionKey)}>{means}</div>
            );
          })}
        </div>
        <p>Your score: {this.state.correctCount} / {this.state.totalCount}</p>
        {this.state.selectedKey && <button onClick={this.goToNext}>Go to next question</button>}
      </div>
    )
  }

  render = () => {
    const { title } = definition[this.state.languageKey];
    return (
      <div className='page'>
        <h2>{title}</h2>
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
