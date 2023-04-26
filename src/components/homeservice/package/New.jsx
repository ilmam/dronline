import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, Collapse, InputNumber,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import getAgentInstance from '../../../helpers/superagent';
import RemoteSelect from '../../basic/RemoteSelect';
import BinaryUploader from '../../basic/BinaryUploader';

const superagent = getAgentInstance();

const { Option } = Select;
const buttonList = [['undo', 'redo'],
  ['font', 'fontSize', 'formatBlock'],
  ['fontColor', 'hiliteColor', 'bold', 'underline', 'italic'],
  ['outdent', 'indent', 'align', 'horizontalRule', 'list'],
  ['table', 'link', 'image'],
  ['fullScreen', 'print']];
class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      this.setState({ loading: true });
      const data = {
        ...values,
        content_en: values.content_en || '',
        content_ku: values.content_ku || '',
        content_ar: values.content_ar || '',
        content_tr: values.content_tr || '',
        image: values.image ? values.image[0].base64 : undefined,
        package_category_id: values.package_category_id.value,
      };
      superagent
        .post('/admin/package')
        .send(data)
        .end((err) => {
          this.setState({ loading: false });
          if (!err) {
            const { reloadGrid } = this.props;
            reloadGrid();
            this.formRef.current.resetFields();
          }
        });
    };

    this.formRef = React.createRef();
  }

  render() {
    const { loading } = this.state;
    return (
      <Form
        layout="vertical"
        style={{ width: '100%' }}
        ref={this.formRef}
        onFinish={this.onFinish}
      >
        <Row gutter={10}>
          <Col md={12} xs={24}>
            <Form.Item
              label="English Name"
              name="name_en"
              rules={[
                {
                  required: true,
                  message: 'English name is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Arabic Name"
              name="name_ar"
              rules={[
                {
                  required: true,
                  message: 'Arabic name is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Kurdish Name"
              name="name_ku"
              rules={[
                {
                  required: true,
                  message: 'Kurdish name is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Turkish Name"
              name="name_tr"
              rules={[
                {
                  required: true,
                  message: 'Turkish name is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              label="Category"
              name="package_category_id"
              rules={[
                {
                  required: true,
                  message: 'Category is required!',
                },
              ]}
            >
              <RemoteSelect
                endpoint="/admin/packagecategory/list?limit=10&offset=0"
                optiontext={(op) => op.name_en}
              />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              label="Price"
              name="price"
              rules={[
                {
                  required: true,
                  message: 'Price is required!',
                },
              ]}
            >
              <InputNumber step={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              label="Old Price"
              name="old_price"
              rules={[
                {
                  required: true,
                  message: 'Old Price is required!',
                },
              ]}
            >
              <InputNumber step={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              label="Active"
              name="active"
              rules={[
                {
                  required: true,
                  message: 'Active is required!',
                },
              ]}
            >
              <Select
                placeholder="Select Status"
                allowClear
              >
                <Option value={1}>Yes</Option>
                <Option value={0}>No</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Collapse accordion style={{ margin: '10px 0' }}>
              <Collapse.Panel header="English Content" key="1">
                <Form.Item name="content_en" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Kurdish Content" key="2">
                <Form.Item name="content_ku" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Arabic Content" key="3">
                <Form.Item name="content_ar" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Turkish Content" key="4">
                <Form.Item name="content_tr" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
            </Collapse>
          </Col>
          <Col span={24}>
            <Form.Item
              name="image"
              rules={[
                {
                  required: true,
                  message: 'Image is required!',
                },
              ]}
            >
              <BinaryUploader
                maxFileCount={1}
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              />
            </Form.Item>
          </Col>

        </Row>

        <Row justify="end">
          <Col md={6} xs={24}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              htmlType="submit"
              loading={loading}
              block
            />
          </Col>
        </Row>

      </Form>
    );
  }
}

export default New;
