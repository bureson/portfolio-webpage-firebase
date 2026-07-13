import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { definition } from '../lib/CourseModel';
import { classNames, convertTimestamp, shuffle } from '../lib/Shared';

const ROUND_SIZE = 20;
const LETTERS = ['A', 'B', 'C', 'D'];

class CoursePractice extends Component {

  constructor(props) {
    super(props);
    const languageKey = props.match.params.language;
    this.state = {
      answers: [],
      bestStreak: 0,
      current: 0,
      direction: definition[languageKey].practice,
      languageKey,
      optionKeyList: [],
      queue: [],
      selectedKey: null,
      streak: 0
    }
  }

  componentDidMount = () => {
    document.title = 'Language practice | Ondrej Bures';
    this.startRound();
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.onKeyDown);
    if (this.timeout) clearTimeout(this.timeout);
  }

  isDone = () => {
    return this.state.queue.length > 0 && this.state.current >= this.state.queue.length;
  }

  startRound = () => {
    const course = this.props.course;
    const [firstKey] = this.state.direction;
    // Note: the course can contain the same word twice, ask each word only once per round
    const seenWordList = new Set();
    const uniqueKeyList = [...Array(course.length).keys()].filter(key => {
      const word = (course[key][firstKey] || '').trim().toLowerCase();
      if (!word || seenWordList.has(word)) return false;
      seenWordList.add(word);
      return true;
    });
    const queue = shuffle(uniqueKeyList).slice(0, Math.min(ROUND_SIZE, uniqueKeyList.length));
    this.setState({
      answers: [],
      bestStreak: 0,
      current: 0,
      queue,
      streak: 0
    }, this.generateOptions);
  }

  generateOptions = () => {
    const course = this.props.course;
    const [, secondKey] = this.state.direction;
    const questionKey = this.state.queue[this.state.current];
    // Note: also keep the option texts distinct, a duplicate of the correct
    // translation would render as a second, "wrong" copy of the right answer
    const seenTextList = new Set([(course[questionKey][secondKey] || '').trim().toLowerCase()]);
    const wrongKeyList = shuffle([...Array(course.length).keys()].filter(key => key !== questionKey)).filter(key => {
      const text = (course[key][secondKey] || '').trim().toLowerCase();
      if (!text || seenTextList.has(text)) return false;
      seenTextList.add(text);
      return true;
    }).slice(0, 3);
    this.setState({
      optionKeyList: shuffle([questionKey, ...wrongKeyList]),
      selectedKey: null
    });
  }

  nextQuestion = () => {
    const current = this.state.current + 1;
    if (current >= this.state.queue.length) {
      this.setState({ current }, this.savePersonalBest);
    } else {
      this.setState({ current }, this.generateOptions);
    }
  }

  selectAnswer = (selectedKey) => {
    if (this.state.selectedKey !== null || this.isDone()) return;
    const questionKey = this.state.queue[this.state.current];
    const isCorrect = selectedKey === questionKey;
    const streak = isCorrect ? this.state.streak + 1 : 0;
    this.setState({
      answers: [...this.state.answers, { questionKey, selectedKey, correct: isCorrect }],
      bestStreak: Math.max(this.state.bestStreak, streak),
      selectedKey,
      streak
    });
    this.timeout = setTimeout(this.nextQuestion, 1200);
  }

  skipQuestion = (e) => {
    e.preventDefault();
    if (this.state.selectedKey !== null || this.isDone()) return;
    const questionKey = this.state.queue[this.state.current];
    this.setState({
      answers: [...this.state.answers, { questionKey, selectedKey: null, correct: false }],
      streak: 0
    }, this.nextQuestion);
  }

  onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const index = LETTERS.indexOf(e.key.toUpperCase());
    if (index < 0 || index >= this.state.optionKeyList.length) return;
    this.selectAnswer(this.state.optionKeyList[index]);
  }

  loadPersonalBest = () => {
    try {
      return JSON.parse(localStorage.getItem(`practiceBest.${this.state.languageKey}`));
    } catch (e) {
      return null;
    }
  }

  savePersonalBest = () => {
    const correct = this.state.answers.filter(answer => answer.correct).length;
    const total = this.state.queue.length;
    const best = this.loadPersonalBest();
    if (!best || correct / total > best.correct / best.total) {
      localStorage.setItem(`practiceBest.${this.state.languageKey}`, JSON.stringify({ correct, total }));
    }
  }

  renderDotTrail = () => {
    return (
      <div className='dot-trail'>
        {this.state.queue.map((questionKey, i) => {
          const answer = this.state.answers[i];
          const className = answer
            ? (answer.correct ? 'dot correct' : 'dot wrong')
            : i === this.state.current ? 'dot current' : 'dot';
          return <div key={i} className={className}></div>;
        })}
      </div>
    )
  }

  renderResult = () => {
    const { nativeName, praise } = definition[this.state.languageKey];
    const [firstKey, secondKey] = this.state.direction;
    const correct = this.state.answers.filter(answer => answer.correct).length;
    const total = this.state.queue.length;
    const best = this.loadPersonalBest();
    const missed = this.state.answers.filter(answer => !answer.correct);
    return (
      <div className='practice-page'>
        <div className='quiz-card result'>
          <p className='kicker'>Round complete · {nativeName}</p>
          <div className='score'>{correct}<span> / {total}</span></div>
          <div className='praise'>
            {correct / total >= 0.7
              ? <React.Fragment>{praise} <span>— nicely done.</span></React.Fragment>
              : <React.Fragment>Not this time. <span>— another round?</span></React.Fragment>}
          </div>
          <div className='stats-line'>best streak ★ {this.state.bestStreak}{best && ` · personal best ${best.correct}/${best.total}`}</div>
          {this.renderDotTrail()}
          {missed.length > 0 && <div className='review'>
            <div className='head'>Worth another look</div>
            {missed.map((answer, i) => {
              const question = this.props.course[answer.questionKey];
              return (
                <div className='row' key={i}>
                  <div className='word'>{question[firstKey]}</div>
                  <div className='answer'>{question[secondKey]}</div>
                  <div className='said'>{answer.selectedKey === null ? 'skipped' : `you said: ${this.props.course[answer.selectedKey][secondKey]}`}</div>
                </div>
              )
            })}
          </div>}
          <div className='actions'>
            <button className='primary' onClick={this.startRound}>Play again</button>
            <Link to={`/course/${this.state.languageKey}`}><button>Back to the list</button></Link>
          </div>
        </div>
      </div>
    )
  }

  render = () => {
    if (!this.state.queue.length) return null;
    if (this.isDone()) return this.renderResult();

    const isSelected = this.state.selectedKey !== null;
    const questionKey = this.state.queue[this.state.current];
    const question = this.props.course[questionKey];
    const [firstKey, secondKey] = this.state.direction;
    const correctCount = this.state.answers.filter(answer => answer.correct).length;
    const progress = (this.state.current / this.state.queue.length) * 100;
    return (
      <div className='practice-page'>
        <Link className='back' to={`/course/${this.state.languageKey}`}>← back to the phrase list</Link>
        <div className='quiz-card'>
          <div className='quiz-meta'>
            <div>Question <span>{this.state.current + 1}</span> / {this.state.queue.length}</div>
            <div>Streak <span className='gold'>{this.state.streak > 0 ? '★'.repeat(Math.min(this.state.streak, 5)) : '–'}</span> · Correct <span>{correctCount}</span></div>
          </div>
          <div className='quiz-progress'><div style={{width: `${progress}%`}}></div></div>
          <div className='quiz-question'>
            <p className='kicker'>Choose the correct translation for</p>
            <div className='word'>{question[firstKey]}</div>
            {question.timestamp && <div className='added'>added {convertTimestamp(question.timestamp, 'dd:mm:yyyy')}</div>}
          </div>
          <div key={questionKey} className={classNames('quiz-options', { 'answered': isSelected })}>
            {this.state.optionKeyList.map((optionKey, i) => {
              const option = this.props.course[optionKey][secondKey];
              const isThisKey = isSelected && optionKey === this.state.selectedKey;
              const isCorrectKey = isSelected && optionKey === questionKey;
              const className = classNames('option', { 'correct': isCorrectKey, 'incorrect': isThisKey && !isCorrectKey });
              return (
                <div key={i} className={className} onClick={e => this.selectAnswer(optionKey)}>
                  <span className='letter'>{LETTERS[i]}</span>{option}
                </div>
              );
            })}
          </div>
          <div className='quiz-foot'>
            <div>press A–D or click</div>
            <button onClick={this.skipQuestion}>skip →</button>
          </div>
        </div>
        {this.renderDotTrail()}
      </div>
    )
  }
}

export default CoursePractice;
