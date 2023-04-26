import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Select, Image,
  notification, AutoComplete, Collapse,
} from 'antd';
import {
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';
import BinaryUploader from '../basic/BinaryUploader';
import RemoteSelect from '../basic/RemoteSelect';

const { Option } = Select;
const { Panel } = Collapse;
const superagent = getAgentInstance();

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/article/${id}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name_en: body.name_en,
                name_ar: body.name_ar,
                name_ku: body.name_ku,
                name_tr: body.name_tr,
                content_en: body.content_en,
                content_ar: body.content_ar,
                content_ku: body.content_ku,
                content_tr: body.content_tr,
                image: body.image_id,
                active: body.active,
                is_private: body.is_private,
                category_id: { key: body.category_id, label: body.category_name_en },
              });
              this.setState({ imageSrc: body.image_id });
            }
            this.setState({ loading: false });
          }
        });
    };

    this.onFinish = (values) => {
      const { resourceId } = this.props;
      const { image, imageSrc } = this.state;
      this.setState({ saving: true });
      const data = {
        ...this.formRef.current.getFieldValue(),
        category_id: values.category_id.key,
        original_image: imageSrc,
        image,
      };
      superagent
        .put(`/admin/article/${resourceId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              description: 'Successfully updated ...',
              duration: 4,
            });
            this.formRef.current.resetFields();
            try {
              const { reloadGrid, modal } = this.props;
              reloadGrid();
              modal.close();
            } catch (error) {
              //
            }
          }
          this.setState({ saving: false });
        });
    };

    this.onImageChange = (v) => {
      if (v.length === 1) {
        this.setState({ image: v[0].base64 });
      } else this.setState({ image: undefined });
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchData(resourceId);
  }

  render() {
    const { loading, saving, imageSrc } = this.state;
    const buttonList = [
      // Default
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['paragraphStyle', 'blockquote'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle'],
      ['removeFormat'],
      ['outdent', 'indent'],
      ['align', 'horizontalRule', 'list', 'lineHeight'],
      ['table', 'link', 'image', 'video', 'audio'],
      ['fullScreen', 'showBlocks', 'codeView'],
      ['preview', 'print'],
      [],
      // (min-width:992px)
      ['%992', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike'],
        [':t-More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print'],
        ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'],
      ]],
      // (min-width:768px)
      ['%768', [
        ['undo', 'redo'],
        [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
        [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle', 'removeFormat'],
        [':e-More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
        [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'],
        ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print'],
      ]],
    ];

    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          style={{
            display: loading ? 'none' : undefined,
          }}
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>
            <Col sm={12} xs={24}>
              <Form.Item
                label="English name"
                name="name_en"
                rules={[
                  {
                    required: true,
                    message: 'English name is required!',
                  },
                ]}
              >
                <AutoComplete placeholder="Name of the article in english." />
              </Form.Item>
            </Col>
            <Col sm={12} xs={24}>
              <Form.Item
                label="Kurdish name"
                name="name_ku"
                rules={[
                  {
                    required: true,
                    message: 'Kurdish name is required!',
                  },
                ]}
              >
                <AutoComplete placeholder="Name of the article in kurdish." />
              </Form.Item>
            </Col>

            <Col sm={12} xs={24}>
              <Form.Item
                label="Arabic name"
                name="name_ar"
                rules={[
                  {
                    required: true,
                    message: 'Arabic name is required!',
                  },
                ]}
              >
                <AutoComplete placeholder="Name of the article in arabic." />
              </Form.Item>
            </Col>
            <Col sm={12} xs={24}>
              <Form.Item
                label="Turkish name"
                name="name_tr"
                rules={[
                  {
                    required: true,
                    message: 'Turkish name is required!',
                  },
                ]}
              >
                <AutoComplete placeholder="Name of the article in turkish." />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Category"
                name="category_id"
                rules={[{
                  required: true,
                  message: 'Category is required!',
                }]}
              >
                <RemoteSelect
                  endpoint="/admin/category/list"
                  placeholder="Select a category"
                  optiontext={(op) => (
                    <Row>
                      <Col span={18}>
                        {op.name_en}
                      </Col>
                      <Col
                        span={6}
                        style={{ textAlign: 'end' }}
                        title={op.active ? 'Active Category' : 'Inactive Category'}
                      >
                        {op.active ? <CheckOutlined /> : <CloseOutlined />}
                      </Col>
                    </Row>
                  )}
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                name="is_private"
                label="Is private"
                rules={[
                  {
                    required: true,
                    message: 'Is private is required',
                  },
                ]}
              >
                <Select placeholder="Is the article private?">
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                name="active"
                label="Active"
                rules={[
                  {
                    required: true,
                    message: 'Active is required!',
                  },
                ]}
              >
                <Select placeholder="Select Status">
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24} style={{ marginBottom: 20 }}>
              <Collapse>
                <Panel header="English content" key="1">
                  <Form.Item name="content_en" valuePropName="setContents">
                    <SunEditor setOptions={{ height: 200, buttonList }} />
                  </Form.Item>
                </Panel>
                <Panel header="Arabic content" key="2">
                  <Form.Item name="content_ar" valuePropName="setContents">
                    <SunEditor setOptions={{ height: 200, buttonList }} />
                  </Form.Item>
                </Panel>
                <Panel header="Kurdish content" key="3">
                  <Form.Item name="content_ku" valuePropName="setContents">
                    <SunEditor setOptions={{ height: 200, buttonList }} />
                  </Form.Item>
                </Panel>
                <Panel header="Turkish content" key="4">
                  <Form.Item name="content_tr" valuePropName="setContents">
                    <SunEditor setOptions={{ height: 200, buttonList }} />
                  </Form.Item>
                </Panel>
              </Collapse>
            </Col>

            { imageSrc !== '' ? (
              <Col md={12} sm={24} xs={24}>
                <Form.Item label="Current Image">
                  <Image
                    height={194}
                    src={`${process.env.REACT_APP_API_LINK}/files/${imageSrc}`}
                  />
                </Form.Item>
              </Col>
            ) : null }
            <Col md={12} sm={24} xs={24}>
              <div className="ant-form-item-label">Update Image</div>
              <Form.Item name="image">
                <BinaryUploader
                  onChange={(v) => this.onImageChange(v)}
                  maxFileCount={1}
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col md={6} sm={24} xs={24}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="middle"
                htmlType="submit"
                loading={saving}
                block
              />
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

export default New;
