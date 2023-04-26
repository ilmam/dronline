import React, { Component } from 'react';

import {
  Row, Col, Form, Input,
  Avatar, Switch, Space,
  Button,
} from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

import Loading from '../basic/Loading';
import Modal from '../basic/Modal';
import SendNotification from '../patient/SendNotification';
import getAgentInstance from '../../helpers/superagent';

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
      superagent.get(`/admin/doctor/${id}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name: body.name_en,
                gender: body.gender,
                clinic_name_en: body.clinic_name_en || '---',
                email: body.email || '---',
                phone_no: 0 + body.phone_no.slice(3) || '---',
                clinic_phone_no: body.clinic_phone_no || '---',
                address_title_en: body.address_title_en || '---',
                city: body.city_name_en || '---',
                bio_en: body.bio_en || '---',
                active: Boolean(body.active),
                verified: Boolean(body.verified),
                blocked: Boolean(body.blocked),
                have_consultancy: Boolean(body.have_consultancy),
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
    const { doctorId } = this.props;
    this.fetchData(doctorId);
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
        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : 'initial',
          }}
          ref={this.formRef}
        >
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
                  <Form.Item name="have_consultancy" valuePropName="checked">
                    <Switch checkedChildren="Have Consultancy" unCheckedChildren="No Consultancy" disabled />
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
              <Form.Item label="Phone" name="phone_no">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Clinic Phone" name="clinic_phone_no">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="City" name="city">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Clinic" name="clinic_name_en">
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Address title" name="address_title_en">
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item label="Bio" name="bio_en">
                <Input.TextArea />
              </Form.Item>
            </Col>

          </Row>
        </Form>
      </>
    );
  }
}
