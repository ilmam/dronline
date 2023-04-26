import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, DatePicker, notification, Divider,
} from 'antd';
import {
  SendOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import moment from 'moment';
import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

const { Option } = Select;

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/user/${id}`)
        .end((err, res) => {
          this.setState({ loading: false });
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name: body.name,
                role: body.role,
                email: body.email,
                active: body.active,
                gender: body.gender,
                username: body.username,
                phone_no: body.phone_no.slice(3),
                birthdate: moment(body.birthdate),
              });
            }
            this.setState({ loading: false });
          }
        });
    };

    this.onFinish = (values) => {
      this.setState({ saving: true });
      const { resourceId } = this.props;
      let phoneNo = `${values.country_code}${values.phone_no.replace(/\s/g, '')}`;
      if (values.phone_no.length === 11) {
        phoneNo = `${values.country_code}${values.phone_no.replace(/\s/g, '').slice(1)}`;
      }
      const data = {
        ...values,
        phone_no: phoneNo,
        birthdate: moment(values.birthdate).format('YYYY-MM-DD'),
        extra_phone_no: '',
      };
      superagent
        .put(`/admin/user/${resourceId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              description: 'Updated successfully...',
              duration: 3,
            });
            this.setState({ saving: false });

            try {
              const { reloadGrid, modal } = this.props;
              reloadGrid();
              modal.close();
            } catch (error) {
              // dummy
            }
          } else {
            this.setState({ saving: false });
          }
        });
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
    const { resourceId } = this.props;
    this.fetchData(resourceId);
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    const { loading, saving, isMobile } = this.state;
    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : 'initial',
          }}
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>
            <Col md={12} xs={24}>
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
                <Input disabled />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
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
            <Col md={12} xs={24}>
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
            <Col md={12} xs={24}>
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
                  inputReadOnly={isMobile}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
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
            <Col md={12} xs={24}>
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
            <Col md={12} xs={24}>
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
                <Select
                  placeholder="Role"
                  allowClear
                >
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
            <Divider
              orientation="center"
              plain
            >
              Updating password is optional!
            </Divider>
            <Col md={12} xs={24}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    message: 'Please input your password!',
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="password_retype"
                label="Confirm Password"
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
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col md={6} xs={24}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="middle"
                htmlType="submit"
                loading={saving}
                block
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

export default Edit;
