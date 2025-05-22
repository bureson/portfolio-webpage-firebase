import React, { Component } from 'react';
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, equalTo, push, child, set, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    const db = getDatabase();
    const attachmentRef = query(databaseRef(db, 'attachment'), orderByChild('post'), equalTo(this.state.post));
    onValue(attachmentRef, snapshot => {
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
    const storage = getStorage();
    const fileRef = storageRef(storage, `attachment/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + Math.round(progress) + '% done');
        this.setState({
          progress: Math.round(progress)
        });
      }, error => {
        console.log(error); // Note: eventually handle error
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          const db = getDatabase();
          const attachmentKey = push(child(databaseRef(db), 'attachment')).key;
          set(databaseRef(db, `attachment/${attachmentKey}`), {
            name: file.name,
            post: this.state.post,
            url: downloadURL,
            size: uploadTask.snapshot.totalBytes,
            timestamp: Math.floor(Date.now() / 1000)
          }).then(() => {
            this.setState({
              progress: null
            });
          }).catch(console.log);
        });
      }
    );
  }

  onDelete = (e, attachment) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the attachment?')) {
      const { key, name } = attachment;
      const storage = getStorage();
      const fileRef = storageRef(storage, `attachment/${name}`);
      deleteObject(fileRef).then(() => {
        const db = getDatabase();
        const attachmentRef = databaseRef(db, `attachment/${key}`);
        remove(attachmentRef);
      });
    }
  }

  render = () => {
    const isLoading = this.state.progress !== null;
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
