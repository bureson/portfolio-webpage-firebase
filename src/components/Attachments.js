import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';

class Attachments extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      attachments: [],
      post: props.post,
      progress: null,
      loading: true
    }
  }

  componentDidMount = () => {
    this.attachmentRef = firebase.database().ref('attachment');
    this.attachmentRef.orderByChild('post').equalTo(this.state.post).on('value', snapshot => {
      const payload = snapshot.val() || {};
      const attachments = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        attachments,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.attachmentRef.off();
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  onFileUpload = (e) => {
    const file = e.target.files[0];
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`attachment/${file.name}`).put(file);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + Math.round(progress) + '% done');
        this.setState({
          progress: Math.round(progress)
        });
      }, error => {
        console.log(error); // Note: eventually handle error
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          const attachmentRef = firebase.database().ref('attachment');
          attachmentRef.push({
            name: file.name,
            post: this.state.post,
            url: downloadURL,
            size: uploadTask.snapshot.totalBytes,
            timestamp: Math.floor(Date.now() / 1000)
          }, error => {
            if (error) {
              console.log(error);
            }
          });
          this.setState({
            progress: null
          });
        });
      }
    );
  }

  onDelete = (e, attachment) => {
    if (window.confirm('Are you sure you want to remove the attachment?')) {
      e.preventDefault();
      const {key, name} = attachment;
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(`attachment/${name}`);
      fileRef.delete().then(() => {
        firebase.database().ref(`attachment/${key}`).remove();
      });
    }
  }

  render = () => {
    const isLoading = this.state.progress;
    return (
      <div className='input-group'>
        <label htmlFor='file'>Attachments</label>
        <div className='input-container'>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {this.state.attachments.map((attachment, index) => {
                return (
                  <tr key={index}>
                    <td>{attachment.name}</td>
                    <td><a href={attachment.url} target='_blank' rel='noopener noreferrer'>Link</a></td>
                    <td>{Math.round(attachment.size / 1000)} kB</td>
                    <td>{this.convertTimestamp(attachment.timestamp)}</td>
                    <td><button onClick={(e) => this.onDelete(e, attachment)}><FontAwesomeIcon icon={faTrash} /></button></td>
                  </tr>
                )
              })}
              <tr>
                <td colSpan='5'>
                  {!(isLoading) && <input type='file' id='attachment' onChange={e => this.onFileUpload(e)} />}
                  {isLoading && <progress value={this.state.progress} max='100' />}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Attachments;
