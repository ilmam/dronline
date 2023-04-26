import React from 'react';
import 'suneditor/dist/css/suneditor.min.css';
import suneditor from 'suneditor';
import plugins from 'suneditor/src/plugins';
import uniqid from 'uniqid';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = () => ({
      id: uniqid(),
    });
    this.state = this.initialState();
    this.options = {
      minHeight: 300,
      width: '100%',
      imageUploadSizeLimit: 1000000,
      placeholder: 'create something awesome',
      plugins,
      buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        [
          'fontColor',
          'hiliteColor',
          'removeFormat',
          'bold',
          'underline',
          'italic',
          'strike',
          'subscript',
          'superscript',
        ],
        //   '/',
        ['outdent', 'indent', 'align', 'horizontalRule', 'list'],
        ['table', 'link', 'image', 'video'],
        [
          'fullScreen',
          'showBlocks',
          'codeView',
          'preview',
          'print',
          'save',
          'template',
        ],
      ],
    };
  }

  componentDidMount() {
    const editor = suneditor.create(this.state.id, this.options);
    editor.onChange = (content) => {
      try {
        this.props.onChange(content);
      } catch (e) {}
    };
    this.editor = editor;
    if (this.props.contents) {
      editor.setContents(this.props.contents);
    }
  }

  componentWillUnmount() {
    this.editor.destroy();
  }

  render() {
    return (
      <textarea id={this.state.id}>
        {/* {this.props.contents ? this.props.contents : null} */}
      </textarea>
    );
  }
}

export default Editor;
