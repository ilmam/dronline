import React, { Component } from 'react';

import {
  Row, Col, Form, Input, InputNumber,
  Select, Button, notification,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';

import RemoteSelect from '../../basic/RemoteSelect';
import getAgentInstance from '../../../helpers/superagent';

const { Option } = Select;
const superagent = getAgentInstance();

export default class EditQuestions extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      saving: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      const { specialityId, parentId } = this.props;
      this.setState({ saving: true });
      const data = {
        ...values,
        speciality_id: specialityId,
        next_node_id: values.next_node_id ? values.next_node_id.key : 0,
        parent_id: parentId,
      };
      superagent
        .post('/admin/specialitysurvey/answer')
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Successfully Added to Answers!',
              duration: 2.5,
            });
            try {
              const { reloadTree } = this.props;
              reloadTree(specialityId);
              this.formRef.current.resetFields();
            } catch (error) {
              ///
            }
          }
          this.setState({ saving: false });
        });
    };

    this.formRef = React.createRef();
  }

  render() {
    const { specialityId } = this.props;
    const { saving } = this.state;
    return (
      <>
        <Form
          layout="vertical"
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>
            <Col md={12} xs={24}>
              <Form.Item
                label="English Title"
                name="title_en"
                rules={[
                  {
                    required: true,
                    message: 'English Title is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Kurdish Title"
                name="title_ku"
                rules={[
                  {
                    required: true,
                    message: 'Kurdish Title is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Arabic Title"
                name="title_ar"
                rules={[
                  {
                    required: true,
                    message: 'Arabic Title is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Turkish Title"
                name="title_tr"
                rules={[
                  {
                    required: true,
                    message: 'Turkish Title is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Sort Order"
                name="sort_order"
                rules={[
                  {
                    required: true,
                    message: 'Active is required!',
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
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
                <Select>
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Next Question!"
                name="next_node_id"
              >
                <RemoteSelect
                  endpoint={`/admin/specialitysurvey/question/list?limit=10&offset=0&speciality_id=${specialityId}`}
                  optiontext={(op) => op.title_en}
                  placeholder="Selcet which question Should appear when answered!"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col md={6} sm={24} xs={24}>
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
