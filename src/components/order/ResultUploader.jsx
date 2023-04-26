import React, { Component } from 'react';
import {
  Col, Row,
  Form, Button,
} from 'antd';
import {
  SendOutlined,
} from '@ant-design/icons';

import getAgentInstance from '../../helpers/superagent';
import BinaryUploader from '../basic/BinaryUploader';

const superagent = getAgentInstance();

class Result extends Component {
  constructor() {
    super();
    this.initialState = () => ({
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      const { record } = this.props;
      superagent
        .patch(`/admin/order/${record.id}`)
        .send({
          result: values.file,
        })
        .end((err) => {
          if (!err) {
            //
          }
          const { onProviderUpdate, modal } = this.props;
          onProviderUpdate();
          modal.close();
        });
    };

    this.openProviderModal = () => {
      this.providerBtn.current.click();
    };
    this.providerBtn = React.createRef();
    this.formRef = React.createRef();
  }

  render() {
    return (
      <Form
        ref={this.formRef}
        onFinish={this.onFinish}
      >
        <Row>
          <Col span={24}>
            <Form.Item
              style={{ marginTop: 50 }}
              name="file"
            >
              <BinaryUploader
                maxFileCount={10}
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button
              block
              type="primary"
              icon={<SendOutlined />}
              htmlType="submit"
            />
          </Col>

        </Row>
      </Form>
    );
  }
}

export default Result;
