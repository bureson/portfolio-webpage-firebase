import { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { statusLabel, techList } from '../lib/Projects';
import LazyPhoto from './LazyPhoto';

class ProjectRow extends Component {

  navigate = (e) => {
    // Note: let the project name link handle itself
    if (e.target.closest('a')) return;
    this.props.history.push(`/projects/${this.props.project.key}`);
  }

  render = () => {
    const project = this.props.project;
    const cover = (project.gallery || [])[0];
    const tech = techList(project.tech);
    return (
      <div className='project-row' onClick={this.navigate}>
        <div className='shot'>
          {cover
            ? <LazyPhoto className='photo' src={cover} />
            : <div className='no-shot'>no screenshot yet</div>}
        </div>
        <div className='info'>
          <div className='top'>
            <div className='ident'>
              <Link className='row-link' to={`/projects/${project.key}`}>
                <span className='title'>{project.title}{!project.public && <span className='draft-pill'>draft</span>}</span>
              </Link>
            </div>
            <span className={`status-pill ${project.status}`}>{statusLabel(project.status)}</span>
          </div>
          {project.years && <div className='years'>{project.years}</div>}
          {project.desc && <p className='desc'>{project.desc}</p>}
          <div className='tech-chips'>
            {tech.map(item => <span className='tech' key={item}>{item}</span>)}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(ProjectRow);
