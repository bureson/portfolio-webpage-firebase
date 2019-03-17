import React, { Component } from 'react';

class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false
    }
  }

  toggle = (e) => {
    this.setState({
      active: !this.state.active
    });
  }

  select = (option) => {
    this.toggle();
    this.props.select(option);
  }

  render = () => {
    return (
      <div className={'dropdown inline ' + (this.state.active ? 'active' : 'inactive')}>
        <button onClick={this.toggle}>Sort by: {this.props.selected}</button>
        {this.state.active && <div className='overlay' onClick={this.toggle}></div>}
        {this.state.active && <div className='options'>
          {this.props.optionList.map((option) => {
            return (
              <button key={option.key} onClick={() => this.select(option)}>{option.key}</button>
            );
          })}
        </div>}
      </div>
    )
  }
}

export default Dropdown;
