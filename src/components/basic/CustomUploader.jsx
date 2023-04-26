/* eslint-disable react/destructuring-assignment */
import React from 'react';

import { observer, inject } from 'mobx-react';

import {
  Icon, Popover, Avatar, Row, Col, Button,
} from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import path from 'path';
import uniqid from 'uniqid';
import '@uppy/core/dist/style.css';
// import '@uppy/dashboard/dist/style.css';

import Uppy from '@uppy/core';
import FileInput from '@uppy/file-input';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
import Tus from '@uppy/tus';
import NotificationHandler from './NotificationHandler';
import superagent from '../../helpers/superagent';

const siteConfig = {
  API_LINK: process.env.REACT_APP_API_LINK,
};

@observer
@inject('tokenStore')
class CustomUploader extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = () => ({
      loading: false,
      disabled: false,
      fileList: [],
      savedFileIds: props.fileList || [],
    });
    this.state = this.initialState();
    this.handleChanges = {
      onRemove: async (e, file) => {
        this.inputRef.current.value = '';
        // const { id } = file;
        const filteriedFileList = this.state.fileList.filter(
          (f) => f.id !== file.id,
        );
        this.removeUploadedFile(path.basename(file.response.uploadURL)).then(
          () => {
            this.uppy.removeFile(file.id);
            this.setState(
              { fileList: filteriedFileList, loading: false },
              () => {
                try {
                  this.props.onUploaderChanged(
                    {},
                    this.state.fileList,
                    this.state.savedFileIds,
                  );
                } catch (e) {}
              },
            );
          },
        );
      },
      onRemoveSaved: async (e, fileId) => {
        const filteriedFileList = this.state.savedFileIds.filter(
          (f) => f !== fileId,
        );
        this.removeUploadedFile(fileId).then(() => {
          this.setState(
            { savedFileIds: filteriedFileList, loading: false },
            () => {
              try {
                this.props.onUploaderChanged(
                  {},
                  this.state.fileList,
                  this.state.savedFileIds,
                );
              } catch (e) {}
            },
          );
        });
      },
      inputChanged: (event) => {
        const [file] = event.target.files;
        try {
          this.uppy.addFile({
            source: 'file input',
            name: `${file.name}-${uniqid()}`,
            type: file.type,
            data: file,
          });
          this.setState({ loading: true });
          this.uppy.upload().then((result) => {
            // console.info('Successful uploads:', result.successful)
            // this.uppy.removeFile(file.id);
            if (result.failed.length > 0) {
              result.failed.forEach((file) => {
                this.uppy.removeFile(file.id);
                NotificationHandler.error(file.name, file.error);
                this.setState({ loading: false });
              });
            } else {
              this.setState(
                { fileList: this.uppy.getFiles(), loading: false },
                () => {
                  try {
                    this.props.onUploaderChanged(
                      result,
                      this.state.fileList,
                      this.state.savedFileIds,
                    );
                  } catch (e) {}
                },
              );
            }
          });
        } catch (err) {
          if (err.isRestriction) {
            NotificationHandler.error('File Picker Error', err.message);
          } else {
            NotificationHandler.error('File Picker Error', err.message);
          }
        }
      },
      uploadClicked: () => {
        this.inputRef.current.click();
      },
    };

    const restrictions = {

      maxFileSize: 1000000,
      maxNumberOfFiles: 1,
      minNumberOfFiles: 0,
      allowedFileTypes: ['image/*'],
      ...props.restrictions || {},
    };
    this.restrictions = restrictions;

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

    this.removeUploadedFile = (id) => {
      this.setState({ loading: true });
      return superagent
        .delete(`${siteConfig.API_LINK}/${id}`, this.headerOptions)
        .end((err, info) => {
          if (!err) {
            try {
              this.props.onRemoveSuccess((err, info), this);
            } catch (e) {}
          } else {
            try {
              this.props.onRemoveFail(err, this);
            } catch (e) {}
            this.setState({ loading: false });
          }
        });
    };
    this.inputRef = React.createRef();
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
      // endpoint: `http://google.com/storage`,
      endpoint: `${siteConfig.API_LINK}/storage`,
      headers: {
        Authorization: `Bearer ${this.props.tokenStore.value}`,
      },
    });
    this.uppy.on('complete', (result) => {
      try {
        return this.props.onComplete(result, this);
      } catch (e) {}
    });
    this.uppy.use(ThumbnailGenerator, {
      thumbnailWidth: 350,
      // thumbnailHeight: 200 // optional, use either width or height,
      waitForThumbnailsBeforeUpload: true,
    });

    this.uppy.use(FileInput, {
      target: '#filePicker',
      pretty: true,
      inputName: 'files[]',
      locale: {},
    });

    this.uppy.on('thumbnail:generated', (file, preview) => {
      const img = document.createElement('img');
      img.src = preview;
      img.width = 100;
      document.body.appendChild(img);
    });
  }

  componentWillUnmount() {
    this.uppy.close();
  }

  render() {
    const { fileList, savedFileIds } = this.state;
    return (
      <div>
        <style>
          {`
              .custom-upload-container{
                width: 105px;
                background: #fafafa;
                border: 1px dashed #d9d9d9;
                border-radius: 3px;
                height: 105px;
                padding: 30px;
                -webkit-transition: all 0.3s ease-out;
                -moz-transition: all 0.3s ease-out;
                -o-transition: all 0.3s ease-out;
                transition: all 0.3s ease-out;
              }
              .custom-image-container{
                width: 105px;
                background: #fafafa;
                border: 1px dashed #d9d9d9;
                background-size: contain;
                border-radius: 3px;
                height: 105px;
                padding: 30px;
                margin-right: 10px;
                -webkit-transition: all 0.3s ease-out;
                -moz-transition: all 0.3s ease-out;
                -o-transition: all 0.3s ease-out;
                transition: all 0.3s ease-out;
              }
              .custom-upload-container .ant-upload-text{
                text-align: center;
                margin-left: -10px;
                margin-right: -10px;
              }
              .custom-upload-container:hover {
                border: 1px dashed #1890ff;
                cursor: pointer;
              }
            `}

        </style>

        <Row>
          {savedFileIds.map((fileId) => {
            const imgPath = `${siteConfig.API_LINK}/${fileId}`;
            const avatarProps = { src: imgPath };

            const popOverContent = (
              <div key={uniqid()}>
                <img width="250" src={imgPath} />
                <br />
                <Button.Group size="small" style={{ margin: 5 }}>
                  <a
                    className="ant-btn ant-btn-dashed"
                    href={imgPath}
                    target="_blank"
                  >
                    <DownloadOutlined />
                  </a>
                  <Button
                    onClick={(e) => this.handleChanges.onRemoveSaved(e, fileId)}
                    type="danger"
                  >
                    <DeleteOutlined />
                  </Button>
                </Button.Group>
              </div>
            );
            return (
              <Col xs={24} sm={5} md={3} lg={3} xl={3} key={uniqid()}>
                <Popover placement="bottom" content={popOverContent}>
                  {this.restrictions.allowedFileTypes[0] == 'image/*' ? (
                    <Avatar shape="square" size={105} {...avatarProps} />
                  ) : (
                    <span>
                      <FileOutlined style={{ fontSize: 50 }} type="file" />
                      {' '}
                      Attachment Found
                    </span>
                  )}
                </Popover>
              </Col>
            );
          })}
          {fileList.map((file) => {
            const avatarProps = { src: file.preview };
            const imgPath = `${siteConfig.API_LINK}/${path.basename(
              file.response.uploadURL,
            )}`;
            const popOverContent = (
              <div key={uniqid()}>
                <img width="250" src={file.preview} />
                <br />
                <Button.Group size="small" style={{ margin: 5 }}>
                  <a
                    className="ant-btn ant-btn-dashed"
                    href={imgPath}
                    target="_blank"
                  >
                    <DownloadOutlined />
                  </a>
                  <Button
                    onClick={(e) => this.handleChanges.onRemove(e, file)}
                    type="danger"
                  >
                    <DeleteOutlined />
                  </Button>
                </Button.Group>
              </div>
            );
            return (
              <Col xs={24} sm={5} md={24} lg={24} xl={24} key={uniqid()}>
                <Popover placement="bottom" content={popOverContent}>
                  {this.restrictions.allowedFileTypes[0] == 'image/*' ? (
                    <Avatar
                      alt={file.name}
                      shape="square"
                      size={105}
                      {...avatarProps}
                    />
                  ) : (
                    <span>
                      <FileOutlined style={{ fontSize: 50 }} type="file" />
                      {' '}
                      Attachment Found
                    </span>
                  )}
                </Popover>
              </Col>
            );
          })}
          {fileList.length + savedFileIds.length
          < this.restrictions.maxNumberOfFiles ? (
            <Col
              span={this.props.span ? this.props.span : 10}
              style={{ zIndex: 9999 }}
            >
              <button
                style={{ width: '100%' }}
                onClick={this.handleChanges.uploadClicked}
                className="custom-upload-container"
                type="button"
              >
                <div className="ant-upload-text">
                  {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
                  <br />
                  {this.props.label ? this.props.label : 'Upload'}
                </div>
              </button>
            </Col>
            ) : null}
        </Row>

        <input
          style={{ display: 'none' }}
          ref={this.inputRef}
          type="file"
          onChange={this.handleChanges.inputChanged}
          id="filePicker"
        />
      </div>
    );
  }
}

export default CustomUploader;
