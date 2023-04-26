import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';

import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      this.setState({ loading: true });
      let phoneNo = `${values.country_code}${values.phone_no.replace(/\s/g, '')}`;
      if (values.phone_no.length === 11) {
        phoneNo = `${values.country_code}${values.phone_no.replace(/\s/g, '').slice(1)}`;
      }
      const data = {
        name: values.name,
        phone_no: phoneNo,
      };
      superagent
        .post('/admin/doctor/')
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
          <Col
            span={24}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Name is required!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col
            span={24}
          >
            <Form.Item
              label="Phone Number"
              name="phone_no"
              rules={[
                {
                  required: true,
                  message: 'Phone number is required!',
                },
              ]}
            >
              <Input
                size="middle"
                placeholder="Enter phone number"
                addonBefore={(
                  <Form.Item name="country_code" noStyle initialValue="964">
                    <Select>
                      <Select.Option value="964">964</Select.Option>
                    </Select>
                  </Form.Item>
                        )}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end">
          <Col
            lg={6}
            md={6}
            sm={24}
            xs={24}
          >
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
