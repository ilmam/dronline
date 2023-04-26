import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, DatePicker, notification,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import moment from 'moment';
import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';
import RemoteSelect from '../basic/RemoteSelect';

const superagent = getAgentInstance();

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/patient/${id}`)
        .end((err, res) => {
          this.setState({ loading: false });
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                username: body.username,
                name: body.name,
                marital_status: body.marital_status,
                gender: body.gender,
                birthdate: body.birthdate === null ? moment() : moment(body.birthdate),
                phone_no: body.phone_no.slice(3),
                occupation: body.occupation,
                email: body.email,
                allow_doctors_to_update_profile:
                body.allow_doctors_to_update_profile
                  ? 'Doctors are allowed to update profile'
                  : 'Doctors are not allowed to update profile',
                role: body.role,
                city_id: body.city_id === 0
                  ? undefined : { label: body.city_name_en, value: body.city_id },
                active: body.active,
              });
              this.setState({
                isAllowed: body.allow_doctors_to_update_profile,
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
        city_id: values.city_id.value,
        phone_no: phoneNo,
        birthdate: moment(values.birthdate).format('YYYY-MM-DD'),
        extra_phone_no: '',
      };
      superagent
        .put(`/admin/patient/${resourceId}`)
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
    const { patientCode } = this.props;
    const {
      loading, saving, isMobile, isAllowed,
    } = this.state;
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
                label={(
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: 5 }}>Name</div>
                    {' '}
                    <Tooltip title="Patient Code">
                      #(
                      {patientCode}
                      )
                    </Tooltip>
                  </div>
                )}
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
                  format={dateFormat}
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
                label="City"
                name="city_id"
                rules={[
                  {
                    required: true,
                    message: 'City is required!',
                  },
                ]}
              >
                <RemoteSelect
                  endpoint="/admin/city/list?limit=10&offset=0"
                  optiontext={(op) => op.name_en}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="marital_status"
                name="marital_status"
                rules={[
                  {
                    required: true,
                    message: 'Role is required!',
                  },
                ]}
              >
                <Select
                  placeholder="Select Matrial Status!"
                  allowClear
                >
                  <Option value="married">Married</Option>
                  <Option value="widowed">Widowed</Option>
                  <Option value="separated">Separated</Option>
                  <Option value="divorced">Divorced</Option>
                  <Option value="single">Single</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Occupation"
                name="occupation"
                rules={[
                  {
                    required: true,
                    message: 'Required!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="allow_doctors_to_update_profile"
              >
                <Input
                  style={{
                    paddingLeft: 0,
                    color: isAllowed ? '#52c41a' : '#cf1322',
                  }}
                  bordered={false}
                  type="ghost"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col md={6} xs={24}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
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

export default Edit;
