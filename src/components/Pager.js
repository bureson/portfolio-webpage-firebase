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

  componentDidUpdate = (prevProps) => {
    if (prevProps.itemsCount !== this.props.itemsCount || prevProps.currentPage !== this.props.currentPage) {
      this.setState({
        itemsCount: this.props.itemsCount,
        page: this.props.currentPage
      });
    }
  }

  render = () => {
    const totalPageCount = Math.ceil(this.state.itemsCount / this.state.perPage);
    const pageCount = Math.min(totalPageCount, 10); // Note: max 10 pages
    const pageDiff = totalPageCount - this.state.page;
    const closeToEnd = pageDiff < 6;
    const deduction = closeToEnd ? 9 - pageDiff : 3;
    const firstPage = Math.max(this.state.page - deduction, 1);
    const lastIndex = Math.max(totalPageCount - 1, 0);
    return (
      <nav className='pager'>
        <ul>
          <li><button onClick={e => this.props.onPageChange(e, 0)}>&lt;&lt;</button></li>
          {[...Array(pageCount).keys()].map(i => {
            const page = i + firstPage;
            const index = page - 1;
            return (
              <li key={i} className={index === this.state.page ? 'active' : undefined}>
                <button onClick={e => this.props.onPageChange(e, index)}>{page}</button>
              </li>
            )
          })}
          <li><button onClick={e => this.props.onPageChange(e, lastIndex)}>&gt;&gt;</button></li>
        </ul>
      </nav>
    )
  }
}

export default Pager;
