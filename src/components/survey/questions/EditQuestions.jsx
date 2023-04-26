import React, { Component } from 'react';

import {
  Row, Col, Form, Input, InputNumber,
  Select, Button, notification,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';

import Loading from '../../basic/Loading';
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

    this.fetchQuestion = (id) => {
      this.setState({ loading: true });
      superagent
        .get(`/admin/specialitysurvey/${id}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                title_en: body.title_en || undefined,
                title_ku: body.title_ku || undefined,
                title_ar: body.title_ar || undefined,
                title_tr: body.title_tr || undefined,
                answer_type: body.answer_type || undefined,
                sort_order: body.sort_order || 0,
                active: body.active,
              });
            }
          }
          this.setState({ loading: false });
        });
    };

    this.onFinish = (values) => {
      this.setState({ saving: true });
      const data = {
        ...values,
      };
      const { resourceId } = this.props;
      superagent
        .put(`/admin/specialitysurvey/question/${resourceId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              duration: 2.5,
            });
            try {
              const { onSuccess } = this.props;
              onSuccess(resourceId, data);
            } catch (error) {
              ///
            }
          }
          this.setState({ saving: false });
        });
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchQuestion(resourceId);
  }

  render() {
    const { saving, loading } = this.state;
    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          ref={this.formRef}
          onFinish={this.onFinish}
          style={{ display: loading ? 'none' : undefined }}
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
                <Input.TextArea rows={3} />
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
                <Input.TextArea rows={3} />
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
                <Input.TextArea rows={3} />
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
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Answer Type"
                name="answer_type"
                rules={[
                  {
                    required: true,
                    message: 'Answer Type is required!',
                  },
                ]}
              >
                <Select>
                  <Option value="radiobox">Radiobox</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col md={6} xs={24}>
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
            <Col md={6} xs={24}>
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
