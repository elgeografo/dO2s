import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import FtpClientItems from './ftp-client-items';

import './FileTransferUi.scss';

class FileTransferUi extends Component {
  constructor(props) {
    super(props);

    this.state = {
      localFiles: [],
      serverFiles: [],
      uploadedSoFar: '',
    };
    const rootDirectory = 'C:/Oficina/Universidad/TFM';
    this.selectedLocalFiles = new Set();
  }
  componentDidMount() {
  }

  selectFiles() {
    this.selectedLocalFiles = new Set();
    const btnFiles = this.refs.btnSelectedFiles;
    for (let i = 0; i < this.refs.btnSelectedFiles.files.length; i++) {
      this.selectedLocalFiles.add(this.refs.btnSelectedFiles.files[i]);
    }
    this.renderLocalFiles(this.selectedLocalFiles);
  }

  removeLocalFile(parent, file) {
    if (parent.selectedLocalFiles.has(file)) {
      parent.selectedLocalFiles.delete(file);
    }
    parent.renderLocalFiles(parent.selectedLocalFiles);
  }

  loadLocalFiles(path, files, callback) {
    /*
    Meteor.apply('saveLocalFiles', [path, files], { wait: true,
      onResultReceived: (error, result) => {
        if (result) {
          if (result.result === 'ok') {
            callback(`file copied${result}`);
          } else {
            callback(`Ooops. Something strange has happened copying the file: ${result}`);
          }
        }
      }
    }); */

    Meteor.call('prueba', (error, result) => {
      if (result) {
        console.log('Removed  folders');
      } else {
        console.log(error);
      }
    });
  }
  uploadFiles() {
    this.loadLocalFiles('', this.state.localFiles, (data) => {
      console.log(data);
    });
  }
  renderLocalFiles(files) {
    const fileList = [];
    // for(let i = 0; i < files.length; i++){
    files.forEach((file) => {
      const fileObj = (
        <FtpClientItems
          objFile={file}
          key={file.name}
          onchangeCheck={this.onChangeCheck}
          onDelete={this.removeLocalFile}
          onUpload={this.uploadLocalFile}
          parent={this}
          drawCheck={false}
          drawTrash
          drawUpload
        />);

      fileList.push(fileObj);
    });

    this.setState({
      localFiles: fileList,
    });
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-5">
          <h3 className="redColored big-glyph text-center">Client side</h3>
          <div className="ftpFileContainer" id="ftpClientSide">{this.state.localFiles}</div>
          <div className="row btn-group centerBlock data-input">
            <label className="btn btn-lg btn-danger centerBlock">
              <i className="fa fa-folder-open" aria-hidden="true" /> Browse
              <input ref="btnSelectedFiles" id="uploadFile" className="file" type="file" multiple onChange={this.selectFiles.bind(this)} />
            </label>
            <label className="btn btn-lg btn-danger" onClick={() => { this.uploadFiles(); }}>
              <i className="fa fa-upload" aria-hidden="true" /> Upload {() => { }}
            </label>
          </div>
        </div>
        <div className="col-md-2" />

        <div className="col-md-5">
          <h3 className="redColored big-glyph text-center">Server side</h3>
          <div className="ftpFileContainer" id="ftpServerSide" />
        </div>
      </div>
    );
  }
}

FileTransferUi.propTypes = {
  // serverPath: PropTypes.string.isRequired,
};

export default FileTransferUi;
