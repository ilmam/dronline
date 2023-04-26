import React, { Component } from 'react';

import {
  Row, Col, Form, Input,
  Avatar, Switch, Space,
  Button,
} from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

import moment from 'moment';
import Modal from '../basic/Modal';
import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';
import SendNotification from '../patient/SendNotification';

const superagent = getAgentInstance();

export default class PatientInformation extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      data: [],
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/patient/${id}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name: body.name,
                gender: body.gender,
                birthdate: moment(body.birthdate).format('YYYY-MM-DD'),
                email: body.email || '---',
                phone_no: 0 + body.phone_no.slice(3) || '---',
                marital_status: body.marital_status,
                city: body.city_name_en || '---',
                occupation: body.occupation || '---',
                active: Boolean(body.active),
                verified: Boolean(body.verified),
                blocked: Boolean(body.blocked),
              });
              this.setState({ data: body });
            }
          }
          this.setState({ loading: false });
        });
    };

    this.SendNotification = async (fmc) => {
      await this.setState({
        fcmToken: fmc,
      });
      this.sendNotiicationRef.current.click();
    };

    this.sendNotiicationRef = React.createRef();
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { patientId } = this.props;
    this.fetchData(patientId);
  }

  render() {
    const { loading, data, fcmToken } = this.state;
    return (
      <>
        <style>
          {`
            .ant-switch-disabled{
              opacity: 1;
            }
            .avatarShadow {
              box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px, rgba(0, 0, 0, 0.19) 0px 6px 20px 0px;
            }
        `}
        </style>
        <Modal
          btnRef={this.sendNotiicationRef}
          header="Send Notification"
          size="modal-sm"
        >
          <SendNotification fcmToken={fcmToken} />
        </Modal>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : 'initial',
          }}
          ref={this.formRef}
        >
          { data.fcm_token ? (
            <Button
              type="primary"
              style={{
                top: 65,
                right: 10,
                zIndex: 10,
                position: 'absolute',
              }}
              onClick={() => this.SendNotification(data.fcm_token)}
            >
              Send Notification
            </Button>
          ) : null}
          <Row gutter={10}>
            <Col span={24} style={{ textAlign: 'center', marginBottom: 15 }}>
              {data.image_id ? (
                <Avatar
                  size={120}
                  src={`${process.env.REACT_APP_API_LINK}/files/${data.image_id}`}
                  className="avatarShadow"
                />
              ) : (
                <Avatar className="avatarShadow" size={120} icon={<UserOutlined />} />
              )}
              <Row>
                <Space>
                  <Form.Item name="active" valuePropName="checked">
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" disabled />
                  </Form.Item>
                  <Form.Item name="verified" valuePropName="checked">
                    <Switch checkedChildren="Verified" unCheckedChildren="Not Verified" disabled />
                  </Form.Item>
                  <Form.Item name="blocked" valuePropName="checked">
                    <Switch checkedChildren="Blocked" unCheckedChildren="Not Blocked" disabled />
                  </Form.Item>
                </Space>
              </Row>
            </Col>

            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Name" name="name">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Gender" name="gender">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Birthdate" name="birthdate">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Phone" name="phone_no">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Marital status" name="marital_status">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="City" name="city">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Occupation" name="occupation">
                <Input />
              </Form.Item>
            </Col>

          </Row>
        </Form>
      </>
    );
  }
}
