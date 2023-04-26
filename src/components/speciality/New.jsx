import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, Tooltip,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import RemoteSelect from '../basic/RemoteSelect';
import BinaryUploader from '../basic/BinaryUploader';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

const { Option } = Select;

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      this.setState({ loading: true });
      const { image } = this.state;
      const data = {
        ...values,
        image,
        parent_id: values.parent_id ? values.parent_id.key : 0,
      };
      superagent
        .post('/admin/speciality')
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

    this.onImageChange = (v) => {
      if (v.length === 1) {
        this.setState({ image: v[0].base64 });
      } else this.setState({ image: undefined });
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
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
          <Col md={12} xs={24}>
            <Form.Item
              label="Speciality parent"
              name="parent_id"
            >
              <RemoteSelect
                placeholder="Selcet a parent for this speciality"
                endpoint="/admin/speciality/list"
                onChange={this.selectedSpeciality}
                optiontext={(op) => (
                  <>
                    <Row>
                      <Col span={16}>
                        <div>{op.name_en}</div>
                      </Col>
                      <Col span={8} style={{ textAlign: 'end' }}>
                        <Tooltip
                          color="#34d698"
                          placement="top"
                          title={(
                            <>
                              <div>
                                Active:
                                {' '}
                                {op.active ? 'True' : 'False'}
                              </div>
                            </>
                        )}
                        >
                          { op.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                        </Tooltip>
                      </Col>
                    </Row>
                  </>
                )}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
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
                onChange={(v) => this.onImageChange(v)}
                maxFileCount={1}
                accept="image/jpeg,image/png,image/gif,image/webp"
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
