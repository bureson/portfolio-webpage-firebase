import { getDatabase, ref as databaseRef, push, child, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Uploads a file to storage and records it under /attachment, resolving
// with the stored record so callers can insert it into the post body
export const uploadAttachment = (file, postKey, onProgress) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();
    const fileRef = storageRef(storage, `attachment/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress && onProgress(Math.round(progress));
      }, reject, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          const db = getDatabase();
          const attachment = {
            name: file.name,
            post: postKey,
            url,
            size: uploadTask.snapshot.totalBytes,
            timestamp: Math.floor(Date.now() / 1000)
          };
          const attachmentKey = push(child(databaseRef(db), 'attachment')).key;
          set(databaseRef(db, `attachment/${attachmentKey}`), attachment)
            .then(() => resolve(Object.assign({ key: attachmentKey }, attachment)))
            .catch(reject);
        }).catch(reject);
      }
    );
  });
}

export const isImage = (fileName) => {
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(fileName);
}
