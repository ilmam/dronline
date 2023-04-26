import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, notification, Collapse, DatePicker,
} from 'antd';
import {
  SendOutlined,
} from '@ant-design/icons';

import moment from 'moment';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';

const dateFormat = 'YYYY-MM-DD';
const superagent = getAgentInstance();

const { Option } = Select;
const buttonList = [
  ['undo', 'redo'],
  ['font', 'fontSize', 'formatBlock'],
  ['fontColor', 'hiliteColor', 'bold', 'underline', 'italic'],
  ['outdent', 'indent', 'align', 'horizontalRule', 'list'],
  ['table', 'link', 'image'],
  ['fullScreen', 'print'],
];

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent
        .get(`/admin/medicaltip/${id}`)
        .end((err, res) => {
          this.setState({ loading: false });
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name_en: body.name_en,
                name_ar: body.name_ar,
                name_ku: body.name_ku,
                name_tr: body.name_tr,
                content_en: body.content_en,
                content_ku: body.content_ku,
                content_ar: body.content_ar,
                content_tr: body.content_tr,
                active: body.active,
              });
            }
            this.setState({ loading: false });
          }
        });
    };

    this.onFinish = (values) => {
      this.setState({ saving: true });
      const dateFrom = moment(values.date[0]).format(dateFormat);
      const toDate = moment(values.date[1]).format(dateFormat);
      const data = {
        ...values,
        from_date: dateFrom,
        to_date: toDate,
      };
      const { resourceId } = this.props;
      superagent
        .put(`/admin/medicaltip/${resourceId}`)
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
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchData(resourceId);
  }

  render() {
    const { loading, saving } = this.state;
    const { rowData } = this.props;
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
                label="English Name"
                name="name_en"
                rules={[
                  {
                    required: true,
                    message: 'English name is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Arabic Name"
                name="name_ar"
                rules={[
                  {
                    required: true,
                    message: 'Arabic name is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Kurdish Name"
                name="name_ku"
                rules={[
                  {
                    required: true,
                    message: 'Kurdish name is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Turkish Name"
                name="name_tr"
                rules={[
                  {
                    required: true,
                    message: 'Turkish name is required!',
                  },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="date"
                label="Date"
                initialValue={
                  [moment(moment(rowData.from_date), dateFormat),
                    moment(moment(rowData.to_date), dateFormat)]
                }
              >
                <DatePicker.RangePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  allowClear={false}
                />
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
                <Select
                  placeholder="Select Status"
                  allowClear
                >
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Collapse accordion style={{ margin: '10px 0' }}>
                <Collapse.Panel forceRender header="English Content" key="1">
                  <Form.Item name="content_en" valuePropName="setContents">
                    <SunEditor
                      setOptions={{
                        height: 200,
                        buttonList,
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel forceRender header="Kurdish Content" key="2">
                  <Form.Item name="content_ku" valuePropName="setContents">
                    <SunEditor
                      setOptions={{
                        height: 200,
                        buttonList,
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel forceRender header="Arabic Content" key="3">
                  <Form.Item name="content_ar" valuePropName="setContents">
                    <SunEditor
                      setOptions={{
                        height: 200,
                        buttonList,
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel forceRender header="Turkish Content" key="4">
                  <Form.Item name="content_tr" valuePropName="setContents">
                    <SunEditor
                      setOptions={{
                        height: 200,
                        buttonList,
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
            </Col>

          </Row>
          <Row justify="end">
            <Col md={6} xs={24}>
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

export default Edit;
