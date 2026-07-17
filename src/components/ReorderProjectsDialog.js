import React, { Component } from 'react';
import { getDatabase, ref, set } from 'firebase/database';

import Dialog from './Dialog';
import { classNames } from '../lib/Shared';
import { galleryList, statusLabel, techList } from '../lib/Projects';

class ReorderProjectsDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dragIndex: null,
      projects: props.projects,
      saving: false
    };
  }

  // rows only become draggable once the grab handle is pressed
  onArmDrag = (index) => {
    this.dragArmed = index;
  }

  onDragStart = (e, index) => {
    if (this.dragArmed !== index) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    this.setState({ dragIndex: index });
  }

  onDragOver = (e, index) => {
    e.preventDefault();
    this.setState(state => {
      if (state.dragIndex === null || state.dragIndex === index) {
        return null;
      }
      const projects = [...state.projects];
      const [moved] = projects.splice(state.dragIndex, 1);
      projects.splice(index, 0, moved);
      return { projects, dragIndex: index };
    });
  }

  onDragEnd = () => {
    this.dragArmed = null;
    this.setState({ dragIndex: null });
  }

  onSave = () => {
    this.setState({saving: true});
    const db = getDatabase();
    set(ref(db, 'project-order'), this.state.projects.map(project => project.key))
      .then(this.props.onClose)
      .catch(error => {
        console.log(error); // Note: eventually handle error
        this.setState({saving: false});
      });
  }

  renderRow = (project, index) => {
    const cover = galleryList(project.gallery)[0];
    const meta = [project.years, ...techList(project.tech)].filter(Boolean).join(' · ');
    return (
      <div key={project.key} className={classNames('sort-row', {dragging: index === this.state.dragIndex})}
           draggable onDragStart={e => this.onDragStart(e, index)} onDragOver={e => this.onDragOver(e, index)}
           onDragEnd={this.onDragEnd} onMouseUp={this.onDragEnd}>
        <span className='handle' title='Drag to reorder' onMouseDown={() => this.onArmDrag(index)}>⠿</span>
        <div className='shot'>{cover && <img src={cover.url} alt='' />}</div>
        <div className='what'>
          <div className='name'>{project.title}{!project.public && <span className='draft-pill'>draft</span>}</div>
          {meta && <div className='meta'>{meta}</div>}
        </div>
        <span className={`status-pill ${project.status}`}>{statusLabel(project.status)}</span>
      </div>
    )
  }

  render = () => {
    return (
      <Dialog className='wide' kicker='Projects' title='Reorder' onClose={this.props.onClose}>
        <div className='dialog-body'>
          <div className='sort-rows'>
            {this.state.projects.map(this.renderRow)}
          </div>
        </div>
        <div className='dialog-foot'>
          <div className='note'>drag ⠿ · top is shown first</div>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={this.state.saving} onClick={this.onSave}>
            {this.state.saving ? 'Saving …' : 'Save order'}
          </button>
        </div>
      </Dialog>
    )
  }

}

export default ReorderProjectsDialog;
