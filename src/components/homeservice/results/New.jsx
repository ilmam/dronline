import React, { Component } from 'react';

import {
  Button, Row, Col, Form, AutoComplete,
  notification, Input,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import getAgentInstance from '../../../helpers/superagent';
import BinaryUploader from '../../basic/BinaryUploader';

const superagent = getAgentInstance();

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = async (values) => {
      this.setState({ loading: true });
      const attachmentArray = values.result;
      let attachments;
      if (values.result && values.result.length > 0) {
        attachments = attachmentArray.map((data) => ({
          name: data.name,
          type: data.type,
          base64: data.base64,
        }));
      }
      const { patientId } = this.props;
      const data = {
        ...values,
         patient_id: patientId,
         result: attachments,
         type:'lab_result',
      };
      superagent
        .post('/admin/patient/testresult')
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Successfully added',
              duration: 3,
            });

            try {
              const { reloadGrid } = this.props;
              this.formRef.current.resetFields();
              reloadGrid(patientId);
            } catch (e) {
              /// /
            }
          }
          this.setState({ loading: false });
        });
    };

    this.formRef = React.createRef();
    this.mapRef = React.createRef();
  }

  render() {
    const { loading } = this.state;
    return (
      <>
        <Form
          layout="vertical"
          style={{ width: '100%' }}
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>

            <Col span={24}>
              <Form.Item
                label="Result title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Title is required!',
                  },
                ]}
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Note"
                name="note"
                rules={[
                  {
                    required: true,
                    message: 'Note is required!',
                  },
                ]}
              >
                <Input.TextArea rows={5} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="ant-form-item-label">Attachments</div>
              <Form.Item
                name="result"
              >
                <BinaryUploader
                  maxFileCount={10}
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                />
              </Form.Item>
            </Col>

          </Row>

          <Row justify="end">
            <Col md={6} sm={24} xs={24}>
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
      </>
    );
  }
}

export default New;
