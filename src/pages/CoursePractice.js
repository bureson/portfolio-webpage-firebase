import React, { Component } from 'react';

// import { definition } from '../lib/CourseModel';
import { classNames, randomNumber, shuffle } from '../lib/Shared';

class CoursePractice extends Component {

  constructor(props) {
    super(props);
    this.state = {
      correctCount: 0,
      languageKey: props.match.params.language,
      optionKeyList: [],
      questionKey: 0,
      selectedKey: null,
      totalCount: 0
    }
  }

  componentDidMount = () => {
    document.title = 'Language practice | Ondrej Bures';
    this.generateQuestion(this.props.course);
  }

  generateQuestion = (course) => {
    const questionKey = randomNumber(course.length - 1);
    const optionKeyList = shuffle([questionKey, ...[...Array(3).keys()].map(_ => randomNumber(course.length - 1))]);
    this.setState({
      questionKey,
      optionKeyList,
      selectedKey: null
    });
  }

  goToNext = () => {
    this.generateQuestion(this.props.course);
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

  render = () => {
    const question = this.props.course[this.state.questionKey];
    const className = classNames('options', { 'result': this.state.selectedKey });
    return (
      <div className='practice'>
        <p>Choose a correct translation for</p>
        <h3>{question.original}</h3>
        <div className={className}>
          {this.state.optionKeyList.map((optionKey, i) => {
            const { means } = this.props.course[optionKey];
            const isThisKey = this.state.selectedKey && optionKey === this.state.selectedKey;
            const isCorrectKey = this.state.selectedKey && optionKey === this.state.questionKey;
            const className = isCorrectKey ? 'correct' : isThisKey ? 'incorrect' : '';
            return (
              <div key={i} className={className} onClick={e => this.selectAnswer(optionKey)}>{means}</div>
            );
          })}
        </div>
        <p>Correct answers: {this.state.correctCount} / {this.state.totalCount}</p>
        {this.state.selectedKey && <button onClick={this.goToNext}>Go to next question</button>}
      </div>
    )
  }
}

export default CoursePractice;
