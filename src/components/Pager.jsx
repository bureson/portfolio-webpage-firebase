import React, { Component } from 'react';

const WINDOW = 1; // pages shown on each side of the current page
const MAX_PLAIN_PAGES = 7; // below this, render all pages without dots

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

  pageList = (totalPageCount) => {
    if (totalPageCount <= MAX_PLAIN_PAGES) {
      return [...Array(totalPageCount).keys()];
    }
    const pages = new Set([0, totalPageCount - 1]);
    // keep the visible window the same size at the edges (1 2 3 4 … N)
    const windowStart = Math.max(0, Math.min(this.state.page - WINDOW, totalPageCount - 4));
    const windowEnd = Math.min(totalPageCount - 1, Math.max(this.state.page + WINDOW, 3));
    for (let i = windowStart; i <= windowEnd; i++) {
      pages.add(i);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const items = [];
    sorted.forEach((page, i) => {
      const gap = i > 0 ? page - sorted[i - 1] : 1;
      if (gap === 2) items.push(page - 1); // a single hidden page is shown, not dots
      if (gap > 2) items.push('gap');
      items.push(page);
    });
    return items;
  }

  render = () => {
    const totalPageCount = Math.ceil(this.state.itemsCount / this.state.perPage);
    const lastIndex = Math.max(totalPageCount - 1, 0);
    return (
      <nav className='pager'>
        <ul>
          <li>
            <button disabled={this.state.page === 0} onClick={e => this.props.onPageChange(e, this.state.page - 1)}>&lt;</button>
          </li>
          {this.pageList(totalPageCount).map((item, i) => {
            if (item === 'gap') {
              return <li key={i} className='gap'><span>&hellip;</span></li>;
            }
            return (
              <li key={i} className={item === this.state.page ? 'active' : undefined}>
                <button onClick={e => this.props.onPageChange(e, item)}>{item + 1}</button>
              </li>
            )
          })}
          <li>
            <button disabled={this.state.page === lastIndex} onClick={e => this.props.onPageChange(e, this.state.page + 1)}>&gt;</button>
          </li>
        </ul>
      </nav>
    )
  }
}

export default Pager;
