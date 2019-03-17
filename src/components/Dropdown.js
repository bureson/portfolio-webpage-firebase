import React, { Component } from 'react';

class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false
    }
  }

  toggle = (e) => {
    e.preventDefault();
    this.setState({
      active: !this.state.active
    });
  }

  select = (e, option) => {
    e.preventDefault();
    this.toggle(e);
    this.props.select(option);
  }

  render = () => {
    return (
      <div className={'dropdown inline ' + (this.state.active ? 'active' : 'inactive')}>
        <button onClick={this.toggle}>{this.props.selected}</button>
        {this.state.active && <div className='overlay' onClick={this.toggle}></div>}
        {this.state.active && <div className='options'>
          {this.props.optionList.map((option) => {
            return (
              <button key={option.key} onClick={(e) => this.select(e, option)}>{option.key}</button>
            );
          })}
        </div>}
      </div>
    )
  }
}

export default Dropdown;
