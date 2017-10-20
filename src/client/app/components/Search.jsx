import React, { Component } from 'react';

class Search extends Component {
  render = () => {
    return (
      <div className={'input-group'}>
        <input
          type={'text'}
          className={'form-control'}
          placeholder={'Search in original ...'}
          value={this.props.value}
          onChange={e => this.props.onChange(e)}
        />
        <span className={'input-group-btn'}>
          <button className={'btn btn-default'} type={'button'}>Search</button>
        </span>
      </div>
    )
  }
}

export default Search;
