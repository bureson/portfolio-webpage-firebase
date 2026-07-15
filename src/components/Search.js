import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
        <FontAwesomeIcon icon={faSearch} />
      </div>
    )
  }
}

export default Search;
