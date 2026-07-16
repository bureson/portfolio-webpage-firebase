import React, { Component } from 'react';
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage';

import { uploadAttachment, isImage } from '../lib/Storage';

class Attachments extends Component {

  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      attachments: [],
      previewKey: null,
      progress: null,
      loading: true
    }
  }

  componentDidMount = () => {
    const db = getDatabase();
    const attachmentRef = query(databaseRef(db, 'attachment'), orderByChild('post'), equalTo(this.props.post));
    this.unsubscribe = onValue(attachmentRef, snapshot => {
      const payload = snapshot.val() || {};
      const attachments = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        attachments,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.unsubscribe && this.unsubscribe();
  }

  onFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;
    uploadAttachment(file, this.props.post, progress => this.setState({progress}))
      .then(() => this.setState({progress: null}))
      .catch(error => {
        console.log(error); // Note: eventually handle error
        this.setState({progress: null});
      });
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
    const isUploading = this.state.progress !== null;
    return (
      <div className='field files'>
        <label>Files ({this.state.attachments.length})</label>
        {isUploading
          ? <progress value={this.state.progress} max='100' />
          : <button className='upload' onClick={() => this.fileInputRef.current.click()}>+ Upload file</button>}
        <input type='file' ref={this.fileInputRef} style={{display: 'none'}} onChange={e => this.onFileUpload(e)} />
        {this.state.attachments.map(attachment => {
          return (
            <div className='file-row' key={attachment.key}
                 onMouseEnter={() => this.setState({previewKey: attachment.key})}
                 onMouseLeave={() => this.setState({previewKey: null})}>
              <button className='name' title='Insert into the post' onClick={() => this.props.onInsert && this.props.onInsert(attachment)}>{attachment.name}</button>
              <span className='size'>{Math.round(attachment.size / 1000)} kB</span>
              <button className='remove' title='Delete file' onClick={(e) => this.onDelete(e, attachment)}>✕</button>
              {this.state.previewKey === attachment.key && isImage(attachment.name) &&
                <div className='preview-pop'><img src={attachment.url} alt={attachment.name} /></div>}
            </div>
          )
        })}
        {!!this.state.attachments.length && <div className='hint'>click a file to insert it at the cursor</div>}
      </div>
    )
  }
}

export default Attachments;
