import React, { Component } from 'react';

class Search extends Component {
  render = () => {
    return (
      <div className='search-group'>
        <input
          type='text'
          className='search'
          placeholder='Type to search ...'
          value={this.props.value}
          onChange={e => this.props.onChange(e)}
        />
        <i className='fas fa-search'></i>
      </div>
    )
  }
}

export default Search;
