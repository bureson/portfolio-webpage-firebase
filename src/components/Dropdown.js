import React, { Component } from 'react';

class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      selectedKey: null
    }
  }

  toggle = (e) => {
    e.preventDefault();
    this.setState({
      active: !this.state.active
    });
  }

  onKeyUp = (e) => {
    if (65 <= e.keyCode && e.keyCode <= 90) { // Note: letters
      const option = this.props.optionList.find(option => option.key.startsWith(e.key));
      if (option) this.select(e, option);
    }
    if (37 <= e.keyCode && e.keyCode <= 40) { // Note: arrows
      const keyIndex = this.props.optionList.map(option => option.key).indexOf(this.state.selectedKey);
      const maxIndex = this.props.optionList.length - 1;
      if (keyIndex >= 1 && [37, 38].includes(e.keyCode)) {
        const option = this.props.optionList[keyIndex - 1];
        this.select(e, option);
      }
      if (keyIndex < maxIndex && [39, 40].includes(e.keyCode)) {
        const option = this.props.optionList[keyIndex + 1];
        this.select(e, option);
      }
    }
  }

  select = (e, option) => {
    e.preventDefault();
    this.close(e);
    this.props.select(option);
    this.setState({
      selectedKey: option.key
    });
  }

  close = () => {
    this.setState({
      active: false
    });
  }

  render = () => {
    return (
      <div className={'dropdown inline ' + (this.state.active ? 'active' : 'inactive')}>
        <button onClick={this.toggle} onKeyUp={this.onKeyUp}>{this.props.selected}</button>
        {this.state.active && <div className='overlay' onClick={this.close}></div>}
        {this.state.active && <div className='options'>
          {this.props.optionList.map((option) => {
            return (
              <button key={option.key} onClick={(e) => this.select(e, option)}>{option.title || option.key}</button>
            );
          })}
        </div>}
      </div>
    )
  }
}

export default Dropdown;
