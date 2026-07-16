import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Converter } from 'showdown';

import { classNames, convertTimestamp } from '../lib/Shared';
import { statusLabel, techList } from '../lib/Projects';
import LazyPhoto from '../components/LazyPhoto';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

class ProjectDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      activeShot: 0,
      blogList: [],
      loading: true,
      project: null
    }
  }

  componentDidMount = () => {
    this.loadData(this.props.match.params.project);
    const db = getDatabase();
    onValue(ref(db, 'blog'), snapshot => {
      const payload = snapshot.val() || {};
      const blogList = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        blogList
      });
    }, { onlyOnce: true });
  }

  componentDidUpdate = (prevProps) => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
    if (prevProps.match.params.project !== this.props.match.params.project) {
      this.setState({
        loading: true,
        activeShot: 0
      });
      this.loadData(this.props.match.params.project);
    }
  }

  loadData = (projectKey) => {
    const db = getDatabase();
    onValue(ref(db, 'project/' + projectKey), snapshot => {
      const payload = snapshot.val();
      document.title = `${payload ? payload.title : 'Not found'} | Ondrej Bures`;
      this.setState({
        project: payload ? Object.assign({
          key: projectKey
        }, payload) : null,
        loading: false
      });
    }, { onlyOnce: true });
  }

  onDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the project?')) {
      const db = getDatabase();
      remove(ref(db, 'project/' + this.state.project.key));
      this.props.history.push('/projects');
    }
  }

  renderGallery = (gallery) => {
    if (!gallery.length) return null;
    return (
      <>
        <div className='project-shot'>
          <LazyPhoto className='photo' src={gallery[this.state.activeShot] || gallery[0]} />
        </div>
        {gallery.length > 1 && <div className='project-thumbs'>
          {gallery.map((url, index) => {
            return (
              <button key={url} className={classNames('thumb', {active: index === this.state.activeShot})}
                      onClick={() => this.setState({activeShot: index})}>
                <img src={url} alt='' />
              </button>
            )
          })}
        </div>}
      </>
    )
  }

  renderPosts = (project) => {
    const postKeys = project.postKeys || [];
    const linkedPosts = this.state.blogList.filter(post => postKeys.includes(post.key) && (post.public || this.state.authed));
    if (!linkedPosts.length) return null;
    return (
      <>
        <p className='kicker section-label'>From the blog</p>
        <div className='project-posts'>
          {linkedPosts.map(post => {
            return (
              <Link key={post.key} to={`/blog/${post.key}`}>
                <span className='name'>{post.title}</span>
                <span className='date'>{convertTimestamp(post.timestamp)}</span>
              </Link>
            )
          })}
        </div>
      </>
    )
  }

  renderStack = (project) => {
    const tech = techList(project.tech);
    if (!tech.length) return null;
    return (
      <div className='rail-card'>
        <p className='kicker'>Stack</p>
        <div className='tech-chips'>
          {tech.map(item => <span className='tech' key={item}>{item}</span>)}
        </div>
      </div>
    )
  }

  renderFacts = (project) => {
    return (
      <div className='rail-card'>
        <p className='kicker'>Facts</p>
        <div className='facts'>
          {project.years && <div className='fact'><span className='label'>years</span><span className='value'>{project.years}</span></div>}
          <div className='fact'><span className='label'>status</span><span className='value'>{statusLabel(project.status)}</span></div>
          {project.repoUrl && <div className='fact'><span className='label'>code</span><span className='value'><a href={project.repoUrl} target='_blank' rel='noreferrer'>repository ↗</a></span></div>}
        </div>
      </div>
    )
  }

  renderMilestones = (project) => {
    const milestones = project.milestones || [];
    if (!milestones.length) return null;
    return (
      <div className='rail-card'>
        <p className='kicker'>Milestones</p>
        <div className='milestones'>
          {milestones.map((milestone, index) => {
            return (
              <div className='item' key={index}>
                <div className='track'>
                  <div className={classNames('dot', {latest: index === 0})}></div>
                  {index < milestones.length - 1 && <div className='line'></div>}
                </div>
                <div className='what'>
                  <div className='name'>{milestone.title}</div>
                  {milestone.date && <div className='date'>{milestone.date}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  render = () => {
    if (this.state.loading) {
      return <Loader />
    }
    if (!this.state.project) {
      return <NoMatch />
    }
    const project = this.state.project;
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    return (
      <div className='page project-page'>
        <div className='project-head'>
          <div>
            <div className='meta-row'>
              {project.years && <p className='kicker'>{project.years}</p>}
              {this.state.authed && <div className='controls'>
                <Link to={`/projects/${project.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
                <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
              </div>}
            </div>
            <h2 className='project-title'>{project.title}{!project.public && <span className='draft-pill'>draft</span>}</h2>
          </div>
          <div className='actions'>
            {project.appUrl && <a className='cta' href={project.appUrl} target='_blank' rel='noreferrer'>Visit the app →</a>}
            {project.repoUrl && <a className='ghost' href={project.repoUrl} target='_blank' rel='noreferrer'>code ↗</a>}
          </div>
        </div>
        {project.desc && <p className='perex'>{project.desc}</p>}
        {this.renderGallery(project.gallery || [])}
        <div className='project-grid'>
          <div>
            <p className='kicker section-label'>The story</p>
            <div className='post-body' dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(project.body || '')}} />
            {this.renderPosts(project)}
          </div>
          <div className='side-rail'>
            {this.renderFacts(project)}
            {this.renderStack(project)}
            {this.renderMilestones(project)}
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectDetail;
