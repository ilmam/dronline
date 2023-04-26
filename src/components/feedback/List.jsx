import React, { Component } from 'react';
import {
  Table, Button, Row, Col,
  Popconfirm, notification,
  Form, Input, Select, DatePicker,
} from 'antd';

import {
  CheckOutlined,
  CloseOutlined,
  FormOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import qs from 'qs';
import _ from 'lodash';
import moment from 'moment';
import debounce from 'lodash/debounce';

import New from './New';
import EditPerson from './Edit';
import Modal from '../basic/Modal';
import getAgentInstance from '../../helpers/superagent';
import resetTableFilters from '../../helpers/resetTableFilters';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '40'];

class List extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
      data: [],
      pagination: {
        pageSize: parseInt(pageSizeOptions[0], 10),
        pageSizeOptions,
        current: 1,
        total: 0,
        showSizeChanger: true,
        hideOnSinglePage: false,
        showQuickJumper: true,
      },
      filteredInfo: null,
      sortedInfo: null,
      editResourceId: undefined,
    });
    this.state = this.initialState();

    resetTableFilters(this);
    textColumnSearchPanel(this);
    selectColumnSearchPanel(this);

    this.isActive = (value) => {
      this.setState({ loading: true });
      superagent
        .patch(`/admin/feedbackquestion/${value.id}`)
        .send({ active: !value.active })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };

    this.delete = (Id) => {
      superagent
        .patch(`/admin/feedbackquestion/${Id}`)
        .send({ deleted: 1 })
        .end((err) => {
          if (!err) {
            this.fetchData();
            notification.warning({
              placement: 'bottomRight',
              message: 'Item got deleted...',
              duration: 2,
            });
          }
        });
    };

    this.columns = [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        sorter: true,
      },
      {
        title: 'Feedback',
        dataIndex: 'name_en',
        key: 'name_en',
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'answer_type',
        key: 'answer_type',
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Page',
        dataIndex: 'page',
        key: 'page',
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (record) => (
          <>
            { moment(record).diff(Date.now(), 'second', true) > -60
              ? 'just now' : null }
            { moment(record).diff(Date.now(), 'second', true) < -60
            && moment(record).diff(Date.now(), 'second', true) > -86400.00
              ? moment(record).fromNow() : null }
            { moment(record).diff(Date.now(), 'second', true) < -86400.00
              ? moment(record).format(dateFormat) : null }
          </>
        ),
      },
      {
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
        sorter: true,
        align: 'center',
        filterMultiple: false,
        render: (record, value) => (
          <>
            <Button
              type="text"
              shape="round"
              onClick={() => this.isActive(value)}
              icon={record
                ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
            />
          </>
        ),
      },
      {
        title: 'Actions',
        align: 'center',
        width: 120,
        render: (object) => (
          <Button.Group size="middle">
            <Button
              onClick={() => this.editBtnClicked(object.id)}
              type="dashed"
              icon={<FormOutlined />}
              shape="round"
            />
            <Popconfirm
              title={`Are you sure delete [${object.name_en}]`}
              onConfirm={() => { this.delete(object.id); }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              placement="bottom"
            >
              <Button type="dashed" icon={<DeleteOutlined />} shape="round" />
            </Popconfirm>
          </Button.Group>
        ),
      },
    ];
    this.handleTableChange = (pagination, filters, sorter) => {
      const pager = pagination;
      pager.current = pagination.current;
      pager.pageSize = pagination.pageSize;
      this.setState(
        {
          pagination: pager,
          filteredInfo: filters,
          sortedInfo: sorter,
        },
        () => this.fetchData(),
      );
    };
    this.fetchData = () => {
      const formData = this.formRef.current.getFieldValue();
      this.setState({ loading: true });
      const { pagination, filteredInfo, sortedInfo } = this.state;
      const params = {
        sorted: [],
        filtered: [],
        pageSize: pagination.pageSize,
        page: pagination.current - 1,
      };
      if (sortedInfo && sortedInfo !== {}) {
        const sortColumn = sortedInfo.field;

        if (sortColumn !== undefined) {
          const sortDirection = sortedInfo.order === 'ascend' ? 'asc' : 'desc';
          params.sorted.push(`${sortColumn}:${sortDirection}`);
        }
      }

      if (formData.date) {
        params.filtered.push(`created_at:${moment(formData.date).format(dateFormat)}`);
      }

      if (formData.feedback) {
        params.filtered.push(`name_en:${formData.feedback}`);
      }

      if (formData.is_active) {
        params.filtered.push(`active:${formData.is_active}`);
      }

      if (filteredInfo && filteredInfo !== {}) {
        const filteredColumns = _.keys(filteredInfo);
        filteredColumns.forEach((column) => {
          const filterValue = filteredInfo[column];
          if (Array.isArray(filterValue) && filterValue.length > 0) {
            params.filtered.push(`${column}:${filterValue[0]}`);
          } else if (
            !Array.isArray(filterValue)
            && filterValue !== null
            && filterValue !== {}
            && filterValue.value
          ) {
            params.filtered.push(`${column}:${filterValue.value}`);
          }
        });
      }

      superagent
        .get(`/admin/feedbackquestion/grid?${qs.stringify(params)}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            pagination.total = body.records;
            this.setState({
              loading: false,
              data: body.data,
              pagination,
            });
          } else {
            this.setState(this.initialState());
          }
        });
    };

    this.onValuesChange = debounce(() => {
      this.fetchData();
    }, 300);

    // custom refs
    this.newBtnClicked = () => {
      this.newBtn.current.click();
    };
    this.newBtn = React.createRef();

    this.editBtn = React.createRef();
    this.editBtnClicked = async (id) => {
      await this.setState({
        editResourceId: id,
      });
      this.editBtn.current.click();
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const {
      data, pagination, loading, editResourceId,
    } = this.state;
    return (
      <div>
        <Modal
          btnRef={this.newBtn}
          size="modal-lg"
          header="Add Entry"
        >
          <New reloadGrid={this.fetchData} />
        </Modal>

        <Modal
          btnRef={this.editBtn}
          header="Edit Entry"
          size="modal-lg"
          onMount={(show, close) => {
            this.closeAvatarModal = close;
          }}
        >
          <EditPerson
            resourceId={editResourceId}
            reloadGrid={this.fetchData}
          />
        </Modal>

        <Col span={24}>
          <Form
            onValuesChange={this.onValuesChange}
            ref={this.formRef}
          >
            <Row gutter={10}>
              <Col md={3} sm={8} xs={24} align="left">
                <Button
                  block
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={this.newBtnClicked}
                  style={{ marginBottom: 10 }}
                >
                  New
                </Button>
              </Col>
              <Col md={8} sm={16} xs={24}>
                <Form.Item
                  name="feedback"
                >
                  <Input autoComplete="off" placeholder="Search for feedback" />
                </Form.Item>
              </Col>
              <Col md={8} sm={12} xs={24}>
                <Form.Item
                  name="date"
                >
                  <DatePicker style={{ width: '100%' }} format={dateFormat} />
                </Form.Item>
              </Col>
              <Col md={5} sm={12} xs={24}>
                <Form.Item
                  name="is_active"
                >
                  <Select placeholder="Is Active!" allowClear>
                    <Option value="1">Yes</Option>
                    <Option value="0">No</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>

        <Table
          columns={this.columns}
          rowKey={(record) => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
          scroll={{ x: 600 }}
        />
      </div>
    );
  }
}

export default List;
