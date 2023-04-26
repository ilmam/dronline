import React, { Component } from 'react';
import uniqid from 'uniqid';

import {
  Button, Row, Col, Form, Input,
  Select, DatePicker,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import moment from 'moment';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

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
        ...values,
        phone_no: phoneNo,
        birthdate: moment(values.birthdate).format(dateFormat).toString(),
        extra_phone_no: '',
      };
      superagent
        .post('/admin/user')
        .send(data)
        .end((err) => {
          this.setState({ loading: false });
          if (!err) {
            const { reloadGrid } = this.props;
            reloadGrid();
            this.formRef.current.resetFields();
            this.generateUsername();
          }
        });
    };

    this.generateUsername = () => {
      const randomUsername = uniqid.time();
      if (this.formRef.current !== null) {
        this.formRef.current.setFieldsValue({
          username: randomUsername,
        });
      }
    };
    this.updateDimensions = debounce(() => {
      this.setState({ windowsWidth: window.innerWidth });
      const { windowsWidth } = this.state;
      if (windowsWidth < 992) {
        this.setState({ isMobile: true });
      } else {
        this.setState({ isMobile: false });
      }
    }, 300);
    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.generateUsername();
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    const { loading, isMobile } = this.state;
    return (
      <Form
        layout="vertical"
        style={{ width: '100%' }}
        ref={this.formRef}
        onFinish={this.onFinish}
      >
        <Row gutter={10}>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Username is required!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
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
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Password',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Confirm Password"
              name="password_retype"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('The two passwords that you entered do not match!');
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                {
                  required: true,
                  message: 'Gender is required!',
                },
              ]}
            >
              <Select
                placeholder="Select gender"
                allowClear
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
                <Option value="unspecified">Unspecified</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Birthday"
              name="birthdate"
              rules={[
                {
                  required: true,
                  message: 'Birthday is required!',
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format={dateFormat}
                inputReadOnly={isMobile}
              />
            </Form.Item>
          </Col>
          <Col
            lg={{ span: 12 }}
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Phone"
              name="phone_no"
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
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
            <Form.Item
              label="Role"
              name="role"
              rules={[
                {
                  required: true,
                  message: 'Role is required!',
                },
              ]}
            >
              <Select>
                <Option value="admin">Admin </Option>
                <Option value="manager">Manager </Option>
                <Option value="booking-admin">Booking Admin </Option>
                <Option value="home-service-admin">Home Service Admin</Option>
                <Option value="article-type-writer">Article Type Writer</Option>
                <Option value="home-service-operation">Home Service Operation</Option>
                <Option value="free-consultation-admin">Free Consultation Admin</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={24}
            xs={24}
          >
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
                <Option value="1">Yes</Option>
                <Option value="0">No</Option>
              </Select>
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
