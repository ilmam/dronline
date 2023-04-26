import React from 'react';

import { DashboardModal } from '@uppy/react';
import '@uppy/core/dist/style.css';
// import '@uppy/dashboard/dist/style.css';

import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

const siteConfig = {
  API_LINK: process.env.REACT_APP_API_LINK,
};

class UppyUploader extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = () => ({
      data: [],
      value: undefined,
      fetching: false,
    });
    this.state = this.initialState();
    const restrictions = {

      maxFileSize: 1000000,
      maxNumberOfFiles: 1,
      minNumberOfFiles: 0,
      allowedFileTypes: ['image/*'],
      ...props.restrictions | {},
    };
    this.uppy = Uppy({
      meta: { type: props.type | 'default' },
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions,
      onBeforeFileAdded: (currentFile, files) => {
        try {
          return props.onBeforeFileAdded(currentFile, files, this);
        } catch (e) {
          return true;
        }
      },
    });
  }

  componentDidMount() {
    this.uppy.on('file-added', (file) => {
      try {
        return this.props.onFileAdded(file, this);
      } catch (e) {}
    });
    this.uppy.on('file-removed', (file) => {
      try {
        return this.props.onFileRemoved(file, this);
      } catch (e) {}
    });
    this.uppy.use(Tus, {
      endpoint: `${siteConfig.API_LINK}/storage`,
      headers: {
        Authorization: `Bearer ${this.props.auth.token}`,
      },
    });
    this.uppy.on('complete', (result) => {
      try {
        return this.props.onComplete(result, this);
      } catch (e) {}
    });
  }

  componentWillUnmount() {
    this.uppy.close();
  }

  render() {
    return (
      <div>
        <style>{'.uppy-Dashboard-inner{min-height: 20px !important}'}</style>
        <DashboardModal
          hidePauseResumeButton={false}
          height={this.props.height | 200}
          inline
          uppy={this.uppy}
        />
      </div>
    );
  }
}

export default UppyUploader;
