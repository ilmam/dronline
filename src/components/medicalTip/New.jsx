import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Collapse, DatePicker,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';

import moment from 'moment';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();
const dateFormat = 'YYYY-MM-DD';
const buttonList = [
  ['undo', 'redo'],
  ['font', 'fontSize', 'formatBlock'],
  ['fontColor', 'hiliteColor', 'bold', 'underline', 'italic'],
  ['outdent', 'indent', 'align', 'horizontalRule', 'list'],
  ['table', 'link', 'image'],
  ['fullScreen', 'print'],
];

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      this.setState({ loading: true });
      const dateFrom = moment(values.date[0]).format(dateFormat);
      const toDate = moment(values.date[1]).format(dateFormat);
      const data = {
        ...values,
        content_en: values.content_en || '',
        content_ku: values.content_ku || '',
        content_ar: values.content_ar || '',
        content_tr: values.content_tr || '',
        from_date: dateFrom,
        to_date: toDate,
        active: 1,
      };
      superagent
        .post('/admin/medicaltip')
        .send(data)
        .end((err) => {
          this.setState({ loading: false });
          if (!err) {
            const { reloadGrid } = this.props;
            reloadGrid();
            this.formRef.current.resetFields();
          }
        });
    };

    this.formRef = React.createRef();
  }

  render() {
    const { loading } = this.state;
    return (
      <Form
        layout="vertical"
        style={{ width: '100%' }}
        ref={this.formRef}
        onFinish={this.onFinish}
      >
        <Row gutter={10}>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title in English"
              name="name_en"
              rules={[
                {
                  required: true,
                  message: 'Title in English is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title in Kurdish"
              name="name_ku"
              rules={[
                {
                  required: true,
                  message: 'Title in Kurdish is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title in Arabic"
              name="name_ar"
              rules={[
                {
                  required: true,
                  message: 'Title in Arabic is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title in Turkish"
              name="name_tr"
              rules={[
                {
                  required: true,
                  message: 'Title in Turkish is required!',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="date"
              label="Date"
              initialValue={[moment(moment(), dateFormat), moment(moment(), dateFormat)]}
            >
              <DatePicker.RangePicker
                format={dateFormat}
                style={{ width: '100%' }}
                allowClear={false}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Collapse accordion style={{ margin: '10px 0' }}>
              <Collapse.Panel header="Content in English" key="1">
                <Form.Item name="content_en" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Content in Kurdish" key="2">
                <Form.Item name="content_ku" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Content in Arabic" key="3">
                <Form.Item name="content_ar" valuePropName="setContents">
                  <SunEditor
                    setOptions={{
                      height: 200,
                      buttonList,
                    }}
                  />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="Content in Turkish" key="4">
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
              icon={<PlusOutlined />}
              size="middle"
              htmlType="submit"
              loading={loading}
              block
            />
          </Col>
        </Row>

      </Form>
    );
  }
}

export default New;
