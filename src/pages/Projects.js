import { Component } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

import Loader from '../components/Loader';
import NewProjectDialog from '../components/NewProjectDialog';
import ProjectRow from '../components/ProjectRow';

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      projects: [],
      loading: true,
      showDialog: false
    }
  }

  componentDidMount = () => {
    document.title = 'Projects | Ondrej Bures';
    const db = getDatabase();
    const projectRef = ref(db, 'project');
    this.unsubscribe = onValue(projectRef, snapshot => {
      const payload = snapshot.val() || {};
      // oldest first, so the numbering follows the project history
      const projects = Object.keys(payload)
            .sort((a, b) => payload[a].timestamp - payload[b].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        projects,
        loading: false
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
  }

  render = () => {
    const availableList = this.state.authed ? this.state.projects : this.state.projects.filter(project => project.public);
    return (
      <div className='page'>
        <div className='page-title'>
          <div>
            <p className='kicker'>Built on the fifth day</p>
            <h2>Side projects</h2>
          </div>
          {this.state.authed && <button onClick={() => this.setState({showDialog: true})}>Add new project</button>}
        </div>
        {this.state.loading
          ? <Loader />
          : <div className='project-list'>
              {availableList.map(project => <ProjectRow key={project.key} project={project} />)}
            </div>}
        {this.state.showDialog && <NewProjectDialog existingKeys={this.state.projects.map(project => project.key)}
                                                    history={this.props.history}
                                                    onClose={() => this.setState({showDialog: false})} />}
      </div>
    )
  }
}

export default Projects;
