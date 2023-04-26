import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, notification, InputNumber,
  Divider, List, Empty,
} from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';

import _ from 'lodash';

import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

const { Option } = Select;

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
      loadingList: false,
      editOptionBtn: false,
      addOptionBtn: true,
      tableData: [],
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/feedbackquestion/${id}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name_en: body.name_en,
                name_ar: body.name_ar,
                name_ku: body.name_ku,
                name_tr: body.name_tr,
                answer_type: body.answer_type,
                page: body.page,
                sort: body.sort,
                active: body.active,
              });
            }
            this.setState({ loading: false, selectedOption: body });
          }
        });
    };

    this.fetchOption = (id) => {
      superagent.get('/admin/feedbackquestionoption/list')
        .query({
          limit: 100,
          offset: 0,
          feedback_question_id: id,
        })
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            this.setState({ tableData: body });
          }
        });
    };

    this.onFinish = (values) => {
      this.setState({ loading: true });
      const { resourceId } = this.props;
      const data = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        name_ku: values.name_ku,
        name_tr: values.name_tr,
        answer_type: values.answer_type,
        sort: values.sort,
        active: values.active,
        page: values.page,
      };
      superagent
        .put(`/admin/feedbackquestion/${resourceId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              duration: 2.5,
            });
            const { reloadGrid, modal } = this.props;
            reloadGrid();
            modal.close();
          }
          this.setState({ loading: false });
        });
    };

    this.onValuesChange = (changedValue, allValues) => {
      if (
        allValues.option_name_en
        && allValues.option_name_ku
        && allValues.option_name_ar
        && allValues.option_name_tr
        && allValues.option_sort
      ) {
        this.setState({ disableAddBtn: true });
      } else {
        this.setState({ disableAddBtn: false });
      }
    };

    this.updateOptions = () => {
      const { selectedOption } = this.state;
      this.onEditOption(selectedOption);
      this.setState({
        disableAddBtn: false,
        disableEditBtn: false,
        editOptionBtn: false,
        addOptionBtn: true,
      });
    };

    this.addOptions = () => {
      const { selectedOption } = this.state;
      this.setState({ loadingList: true });
      const formValues = this.formRef.current.getFieldValue();
      const data = {
        name_en: formValues.option_name_en,
        name_ar: formValues.option_name_ar,
        name_ku: formValues.option_name_ku,
        name_tr: formValues.option_name_tr,
        sort: formValues.option_sort,
        active: formValues.option_active,
        feedback_question_id: selectedOption.id,
      };
      superagent
        .post('/admin/feedbackquestionoption')
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success...',
              duration: 2.5,
            });
            const { resourceId } = this.props;
            this.fetchOption(resourceId);
            this.resetOptions();
          }
          this.setState({ loadingList: false, disableAddBtn: false, disableEditBtn: false });
        });
    };

    this.resetOptions = () => {
      this.formRef.current.resetFields([
        'option_name_en',
        'option_name_ku',
        'option_name_ar',
        'option_name_tr',
        'option_sort',
      ]);
    };

    this.deleteFromState = (i) => {
      const { tableData } = this.state;
      _.pullAt(tableData, [i]);
      this.setState({ tableData });
    };

    this.deleteOption = (index, optionData) => {
      this.deleteFromState(index);
      superagent
        .patch(`/admin/feedbackquestionoption/${optionData.id}`)
        .send({ deleted: 1 })
        .end((err) => {
          if (!err) {
            this.fetchOption(optionData.feedback_question_id);
            notification.warning({
              placement: 'bottomRight',
              message: 'Item got deleted...',
              duration: 2,
            });
          }
        });
    };

    this.onEditOption = (values) => {
      this.setState({ loadingList: true });
      const formValues = this.formRef.current.getFieldValue();
      const data = {
        name_en: formValues.option_name_en,
        name_ar: formValues.option_name_ar,
        name_ku: formValues.option_name_ku,
        name_tr: formValues.option_name_tr,
        sort: formValues.option_sort,
        active: formValues.option_active,
        feedback_question_id: values.id,
      };
      const { selectedOptionId } = this.state;
      superagent
        .put(`/admin/feedbackquestionoption/${selectedOptionId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success...',
              duration: 2.5,
            });
            const { resourceId } = this.props;
            this.fetchOption(resourceId);
            this.resetOptions();
          }
          this.setState({ loadingList: false });
        });
    };

    this.editItems = (index, item) => {
      this.deleteFromState(index);
      this.resetOptions();
      this.formRef.current.setFieldsValue({
        option_name_en: item.name_en,
        option_name_ku: item.name_ku,
        option_name_ar: item.name_ar,
        option_name_tr: item.name_en,
        option_sort: item.sort,
        option_active: item.active,
      });
      this.setState({
        disableAddBtn: true,
        disableEditBtn: true,
        editOptionBtn: true,
        addOptionBtn: false,
        selectedOptionId: item.id,
      });
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchData(resourceId);
    this.fetchOption(resourceId);
  }

  render() {
    const {
      loading, disableAddBtn, tableData, disableEditBtn,
      saving, loadingList, editOptionBtn, addOptionBtn,
    } = this.state;
    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : undefined,
          }}
          ref={this.formRef}
          onFinish={this.onFinish}
          onValuesChange={this.onValuesChange}
        >
          <Row gutter={10}>
            <Col md={6} sm={12} xs={24}>
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
                <Input
                  autoComplete="off"
                  placeholder="Enter english Name"
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
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
                <Input
                  autoComplete="off"
                  placeholder="Enter kurdish name"
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                name="name_ar"
                label="Arabic Name"
                rules={[
                  {
                    required: true,
                    message: 'Arabic name is required!',
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  placeholder="Enter arabic name"
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
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
                <Input
                  autoComplete="off"
                  placeholder="Enter turkish name"
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                label="Answer type"
                name="answer_type"
                initialValue="checkbox"
                rules={[
                  {
                    required: true,
                    message: 'Answer type is required!',
                  },
                ]}
              >
                <Select
                  placeholder="Select answer type"
                  allowClear
                >
                  <Option value="checkbox">Checkbox</Option>
                  <Option value="radiobox">Radio box</Option>
                  <Option value="textinput">Text input</Option>
                  <Option value="date">Date</Option>
                  <Option value="color">Color</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                label="Page"
                name="page"
                initialValue="main"
                rules={[
                  {
                    required: true,
                    message: 'Page is required!',
                  },
                ]}
              >
                <Select
                  placeholder="Select page"
                  allowClear
                >
                  <Option value="main">Main</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                label="Sort"
                name="sort"
                initialValue={1}
                rules={[
                  {
                    required: true,
                    message: 'Sort is required!',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Sort number"
                />
              </Form.Item>
            </Col>
            <Col md={6} sm={12} xs={24}>
              <Form.Item
                label="Active"
                name="active"
                initialValue={1}
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

          </Row>

          <Row justify="end">
            <Col md={6} xs={24}>
              <Button
                block
                size="middle"
                type="primary"
                loading={saving}
                htmlType="submit"
                icon={<SendOutlined />}
              >
                Save
              </Button>
            </Col>
          </Row>
          <Divider orientation="left" style={{ marginTop: 0 }}>
            Options
          </Divider>
          <Col span={24}>
            <Row gutter={10}>

              <Col md={6} sm={12} xs={24}>
                <Form.Item
                  label="Option in english"
                  name="option_name_en"
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col md={6} sm={12} xs={24}>
                <Form.Item
                  label="Option in kurdish"
                  name="option_name_ku"
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col md={6} sm={12} xs={24}>
                <Form.Item
                  label="Option in arabic"
                  name="option_name_ar"
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col md={6} sm={12} xs={24}>
                <Form.Item
                  label="Option in turkish"
                  name="option_name_tr"
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item
                  label="Sort"
                  name="option_sort"
                  initialValue={1}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="Sort number"
                  />
                </Form.Item>
              </Col>
              <Col md={8} xs={24}>
                <Form.Item
                  label="Active"
                  name="option_active"
                  initialValue={1}
                >
                  <Select placeholder="Select Status">
                    <Option value={1}>Yes</Option>
                    <Option value={0}>No</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col md={4} xs={24}>
                { editOptionBtn ? (
                  <Button
                    block
                    size="middle"
                    icon={<SaveOutlined />}
                    onClick={this.updateOptions}
                    disabled={!disableAddBtn}
                    style={{ position: 'relative', top: 30 }}
                  />
                ) : null}
                { addOptionBtn ? (
                  <Button
                    block
                    size="middle"
                    icon={<PlusOutlined />}
                    onClick={this.addOptions}
                    disabled={!disableAddBtn}
                    style={{ position: 'relative', top: 30 }}
                  />
                ) : null}

              </Col>

            </Row>

            <Col span={24} style={{ marginBottom: 20, overflow: 'auto' }}>
              <List bordered style={{ minWidth: 820 }}>
                <div
                  className="transactionItemContainer"
                  style={{ backgroundColor: 'rgb(250, 250, 250)' }}
                >
                  <div>Id</div>
                  <div>English</div>
                  <div>Kurdish</div>
                  <div>Arabic</div>
                  <div>Turkish</div>
                  <div>Sort</div>
                  <div>Active</div>
                </div>

                <div style={{ display: loadingList ? 'none' : undefined }}>
                  { tableData.length ? tableData.map((options, index) => (
                    <div
                      key={Math.random()}
                      className="transactionItemContainer"
                    >
                      <div>{options.id}</div>
                      <div>{options.name_en}</div>
                      <div>{options.name_ku}</div>
                      <div>{options.name_ar}</div>
                      <div>{options.name_tr}</div>
                      <div>{options.sort}</div>
                      <div>{options.active ? 'Yes' : 'No'}</div>
                      <div>
                        <Button.Group size="middle">
                          <Button
                            type="dashed"
                            icon={<EditOutlined />}
                            disabled={disableEditBtn}
                            onClick={() => this.editItems(index, options)}
                          />
                          <Button
                            type="dashed"
                            icon={<DeleteOutlined />}
                            onClick={() => this.deleteOption(index, options)}
                          />
                        </Button.Group>
                      </div>
                    </div>
                  )) : null}
                </div>
                { tableData.length === 0 && !loadingList ? (
                  <Empty style={{ marginTop: 15, marginBottom: 15 }} />
                ) : null}

                <Loading visible={loadingList} />
              </List>
            </Col>

          </Col>
        </Form>
      </>
    );
  }
}

export default Edit;
