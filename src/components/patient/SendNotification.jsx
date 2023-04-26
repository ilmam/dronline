import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  notification,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';

import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

export default class SendNotification extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.onFinish = async (values) => {
      this.setState({ saving: true });
      const { fcmToken } = this.props;

      const data = {
        ...values,
      };
      if (Array.isArray(fcmToken)) {
        this.setState({ saving: true });
        const promises = fcmToken.map((fcm) => superagent
          .post(`/admin/notification/${fcm}`)
          .send(data));
        await Promise.allSettled(promises);
        notification.success({
          placement: 'bottomRight',
          message: 'Bulk notification is sent',
          duration: 3,
        });
        this.setState({ saving: false });
      } else {
        superagent
          .post(`/admin/notification/${fcmToken}`)
          .send(data)
          .end((err) => {
            if (!err) {
              notification.success({
                placement: 'bottomRight',
                message: 'Success',
                duration: 3,
              });
              this.setState({ saving: false });
            } else {
              this.setState({ saving: false });
            }
          });
      }
    };
  }

  render() {
    const { saving } = this.state;
    return (
      <>
        <Col span={24}>
          <Form
            layout="vertical"
            ref={this.formRef}
            onFinish={this.onFinish}
          >
            <Row gutter={10}>
              <Col span={24}>
                <Form.Item
                  label="Message"
                  name="msg"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Button
                  block
                  size="middle"
                  type="primary"
                  loading={saving}
                  htmlType="submit"
                  icon={<SendOutlined />}
                />
              </Col>
            </Row>
          </Form>

        </Col>
      </>
    );
  }
}
