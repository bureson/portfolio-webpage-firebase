import { Component } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

import Loader from '../components/Loader';
import NewProjectDialog from '../components/NewProjectDialog';
import ProjectRow from '../components/ProjectRow';
import ReorderProjectsDialog from '../components/ReorderProjectsDialog';
import { sortProjects } from '../lib/Projects';

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      projects: [],
      order: null,
      loading: true,
      showDialog: false,
      showReorder: false
    }
  }

  componentDidMount = () => {
    document.title = 'Projects | Ondrej Bures';
    const db = getDatabase();
    this.unsubscribe = onValue(ref(db, 'project'), snapshot => {
      const payload = snapshot.val() || {};
      const projects = Object.keys(payload).map(key => Object.assign({key}, payload[key]));
      this.setState({
        projects,
        loading: false
      });
    });
    this.unsubscribeOrder = onValue(ref(db, 'project-order'), snapshot => {
      this.setState({
        order: snapshot.val()
      });
    });
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  componentWillUnmount = () => {
    this.unsubscribe && this.unsubscribe();
    this.unsubscribeOrder && this.unsubscribeOrder();
  }

  render = () => {
    const sorted = sortProjects(this.state.projects, this.state.order);
    const availableList = this.state.authed ? sorted : sorted.filter(project => project.public);
    return (
      <div className='page'>
        <div className='page-title'>
          <div>
            <p className='kicker'>Built on the fifth day</p>
            <h2>Side projects</h2>
          </div>
          {this.state.authed && <div className='admin-actions'>
            {sorted.length > 1 && <button onClick={() => this.setState({showReorder: true})}>Reorder</button>}
            <button onClick={() => this.setState({showDialog: true})}>Add new project</button>
          </div>}
        </div>
        {this.state.loading
          ? <Loader />
          : <div className='project-list'>
              {availableList.map(project => <ProjectRow key={project.key} project={project} />)}
            </div>}
        {this.state.showDialog && <NewProjectDialog existingKeys={this.state.projects.map(project => project.key)}
                                                    history={this.props.history}
                                                    onClose={() => this.setState({showDialog: false})} />}
        {this.state.showReorder && <ReorderProjectsDialog projects={sorted}
                                                          onClose={() => this.setState({showReorder: false})} />}
      </div>
    )
  }
}

export default Projects;
