import React from 'react';
import {
  Row, Col, Form, Input, Button,
} from 'antd';
import { observer, inject } from 'mobx-react';

import getAgentInstance from '../../helpers/superagent';
import notificationHandler from '../../helpers/notificationHandler';

const superagent = getAgentInstance();

@observer
@inject('userStore', 'tokenStore')
class Login extends React.Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();
    this.onFinish = (values) => {
      this.setState({
        loading: true,
      });
      const { userStore, tokenStore } = this.props;
      superagent
        .post('/admin/user/auth')
        .send(values)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            userStore.value = body.data;
            tokenStore.value = body.token;
          } else { notificationHandler(err); }
        });
      this.setState({
        loading: false,
      });
    };
  }

  render() {
    const { loading } = this.state;
    return (
      <>
        <Form
          onFinish={this.onFinish}
          layout="vertical"
        >
          <Row>
            <Col span={24}>
              <Form.Item
                name="username"
                label="User Name"
                rules={[{
                  required: true,
                }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{
                  required: true,
                }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col
              offset={20}
              span={4}
              sm={{ span: 6, offset: 18 }}
              xs={{ span: 24, offset: 0 }}
            >
              <Button
                loading={loading}
                htmlType="submit"
                block
                type="primary"
              >
                Login
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
export default Login;
