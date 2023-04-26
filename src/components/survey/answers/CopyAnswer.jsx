import React, { Component } from 'react';

import {
  Row, Col, Form, Input, InputNumber,
  Select, Button, notification, Tooltip,
} from 'antd';
import { SendOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

import Loading from '../../basic/Loading';
import RemoteSelect from '../../basic/RemoteSelect';
import getAgentInstance from '../../../helpers/superagent';

const { Option } = Select;
const superagent = getAgentInstance();

export default class CopyAnswer extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      saving: false,
      loading: true,
      specialityId: 0,
    });
    this.state = this.initialState();

    this.fetchAnswers = (id) => {
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
        speciality_id: values.speciality_id?.key,
        next_node_id: values.next_node_id ? values.next_node_id.key : 0,
        parent_id: values.parent_id?.key,
      };
      superagent
        .post('/admin/specialitysurvey/answer/')
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              duration: 2.5,
            });
            try {
              const { modal } = this.props;
              modal.close();
            } catch (error) {
              ///
            }
          }
          this.setState({ saving: false });
        });
    };
    this.onValuesChange = (changedValues) => {
      if (changedValues.speciality_id) {
        this.setState({ specialityId: changedValues.speciality_id?.key });
      }
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchAnswers(resourceId);
  }

  render() {
    const { saving, loading, specialityId } = this.state;
    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          ref={this.formRef}
          onFinish={this.onFinish}
          onValuesChange={this.onValuesChange}
          style={{ display: loading ? 'none' : undefined }}
        >
          <Row gutter={10}>
            <Col md={24} xs={24}>
              <Form.Item
                label="Destination Speciality"
                name="speciality_id"
                rules={[
                  {
                    required: true,
                    message: 'Destination Speciality is required',
                  },
                ]}
              >
                <RemoteSelect
                  placeholder="Destination Speciality"
                  endpoint="/admin/speciality/list"
                  onChange={this.selectedSpeciality}
                  optiontext={(op) => (
                    <>
                      <Row>
                        <Col span={16}>
                          <div>{op.name_en}</div>
                        </Col>
                        <Col span={8} style={{ textAlign: 'end' }}>
                          <Tooltip
                            color="#34d698"
                            placement="top"
                            title={(
                              <>
                                <div>
                                  Active:
                                  {' '}
                                  {op.active ? 'True' : 'False'}
                                </div>
                              </>
                                )}
                          >
                            { op.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                          </Tooltip>
                        </Col>
                      </Row>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
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
            <Col span={12}>
              <Form.Item
                label="Parent Question!"
                name="parent_id"
              >
                <RemoteSelect
                  key={`parent-${specialityId}`}
                  endpoint={`/admin/specialitysurvey/question/list?limit=10&offset=0&speciality_id=${specialityId}`}
                  optiontext={(op) => op.title_en}
                  placeholder="Selcet which question Should be a parent for this one"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Next Question!"
                name="next_node_id"
              >
                <RemoteSelect
                  key={`next-${specialityId}`}
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
