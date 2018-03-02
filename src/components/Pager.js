import React, { Component } from 'react';

class Pager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      itemsCount: props.itemsCount,
      page: props.currentPage,
      perPage: props.perPage
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      itemsCount: props.itemsCount,
      page: props.currentPage
    });
  }

  render = () => {
    const pageCount = Math.ceil(this.state.itemsCount / this.state.perPage);
    return (
      <nav className='pager'>
        <ul>
          {[...Array(pageCount).keys()].map(i => {
            return (
              <li key={i} className={i === this.state.page ? 'active' : undefined}>
                <button onClick={e => this.props.onPageChange(e, i)}>{i + 1}</button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
}

export default Pager;
