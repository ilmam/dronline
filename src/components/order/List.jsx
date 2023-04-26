import React, { Component } from 'react';

import {
  Row, Form, Select, notification,
  Col, DatePicker, Input, Button, Tooltip,
  Table, Avatar, Typography, Space, Modal as AntModal,
} from 'antd';
import {
  CheckCircleFilled,
  UserOutlined,
  CloudUploadOutlined,
  ExclamationCircleTwoTone,
} from '@ant-design/icons';
import moment from 'moment';
import '../visit/visit.css';
import debounce from 'lodash/debounce';
import _ from 'lodash';
import qs from 'qs';
import Modal from '../basic/Modal';
import RemoteSelect from '../basic/RemoteSelect';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';
import OrderItem from './OrderItem';
import OrderProvider from './OrderProvider';
import ResultUploader from './ResultUploader';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
const pageSizeOptions = ['15', '20', '25', '30', '40'];
const superagent = getAgentInstance();

class List extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
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
    dateColumnSearchPanel(this);
    this.columns = [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => a.id - b.id,
        render: (id) => (
          <Button
            onClick={() => this.openItemModal(id)}
            type="link"
            style={{ padding: 0 }}
          >
            {id}
          </Button>
        ),
      },
      {
        title: 'Name',
        render: (record) => (
          <Space>
            { record.patient_image_id === null ? (
              <Avatar src={`${process.env.REACT_APP_STORAGE_LINK}/${record.patient_image_id}`} />
            ) : <Avatar icon={<UserOutlined />} />}

            { record.patient_verified && !record.patient_blocked
              ? <div className="customBadge" style={{ background: '#52c41a' }} />
              : <div className="customBadge" style={{ background: '#ff4d4f' }} />}
            <Typography.Text>
              {`${record.patient_name} ${`${record.patient_phone_no}`.slice(3, 13)}`}
            </Typography.Text>
          </Space>
        ),

      },
      {
        title: 'Provider',
        render: (record) => (
          <OrderProvider onProviderUpdate={this.fetchData} record={record} />
        ),
      },
      {
        title: 'Address Note',
        dataIndex: 'address_note',
        key: 'address_note',
        render: (value) => (
          <>
            {`${value.substring(0, 25)}  ` }
            <Tooltip
              placement="topRight"
              title={() => value}
              color="#1f2532"
            >
              <ExclamationCircleTwoTone
                style={{ cursor: 'pointer' }}
                twoToneColor="#33d195"
              />
            </Tooltip>
          </>
        ),
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        ...this.getColumnSearchProps('total'),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        ...this.getColumnSearchProps('status'),
        sorter: true,
        render: (record, values) => (
          <>
            <Row>
              <Col span={20}>
                <Select
                  value={record}
                  bordered={false}
                  style={{ width: '100%' }}
                  disabled={record === 'completed'}
                  onChange={(selectedValue) => this.onStatusChange(selectedValue, values)}
                >
                  <Option value="pending" style={{ color: '#ffc069' }}>Pending</Option>
                  <Option value="received" style={{ color: '#36cfc9' }}>Received</Option>
                  <Option value="ontheway" style={{ color: '#52c41a' }}>On the way</Option>
                  <Option value="completed" style={{ color: '#52c41a' }}>Completed</Option>
                  <Option value="canceled" style={{ color: '#cf1322' }}>Canceled </Option>
                </Select>
              </Col>
              <Col span={4}>
                {/* eslint-disable-next-line no-nested-ternary */}
                {record === 'completed' && values.result === null
                  ? (
                    <Button
                      type="text"
                      icon={<CloudUploadOutlined />}
                      onClick={() => this.openUploaderModal(values)}
                    />
                  )
                  : record === 'completed'
                    ? (
                      <Button
                        style={{ color: '#52c41a' }}
                        type="link"
                        success
                        icon={<CheckCircleFilled />}
                      />
                    )
                    : null}
              </Col>
            </Row>

          </>
        ),
      },
    ];

    this.onStatusChange = (selectedValue, values) => {
      if (selectedValue === 'completed' || selectedValue === 'canceled') {
        AntModal.confirm({
          title: `Are you sure about changing [${values.status}] to [${selectedValue}] !`,
          okText: 'Yes',
          centered: 'centered',
          onOk() {
            superagent
              .patch(`/admin/order/${values.id}`)
              .send({ status: selectedValue })
              .end((err) => {
                if (!err) {
                  notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description: 'Successfully Updated...',
                    duration: 4,
                  });
                }
              });
          },
          onCancel() { },

        }, () => this.fetchData());
      } else {
        superagent
          .patch(`/admin/order/${values.id}`)
          .send({ status: selectedValue })
          .end((err) => {
            if (!err) {
              this.fetchData();
              notification.success({
                placement: 'bottomRight',
                message: 'Success',
                description: 'Successfully Updated...',
                duration: 4,
              });
            }
          });
      }
    };
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
      this.setState({ loading: true });
      const values = this.formRef.current.getFieldsValue();
      const param = {};
      if (values.date) {
        param.from_date = moment(values.date[0]).format(dateFormat);
        param.to_date = moment(values.date[1]).format(dateFormat);
      }
      if (values.patient_name) {
        param.patient_name = values.patient_name;
      }
      if (values.patient_phone) {
        param.patient_phone = `${values.country_code}${values.patient_phone}`;
      }
      if (values.status) {
        param.status = values.status.join(',');
      }
      if (values.city) {
        param.city_id = values.city.value;
      }
      if (values.provider) {
        param.provider_id = values.provider.value;
      }
      const { pagination, filteredInfo, sortedInfo } = this.state;
      const params = {
        from_date: moment().format(dateFormat),
        to_date: moment().format(dateFormat),
        ...param,
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
        .get(`/admin/order/grid?${qs.stringify(params)}`)
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
    this.updateDimensions = debounce(() => {
      this.setState({ windowsWidth: window.innerWidth });
      const { windowsWidth } = this.state;
      if (windowsWidth < 992) {
        this.setState({ isMobile: true });
      } else {
        this.setState({ isMobile: false });
      }
    }, 300);
    this.setCustomInterval = () => {
      this.IntervalRef = setInterval(this.fetchData, 20000);
    };
    this.clearCustomInterval = () => {
      clearInterval(this.IntervalRef);
    };
    this.openUploaderModal = async (record) => {
      await this.setState({
        entry: record,
      });
      this.uploaderRef.current.click();
    };
    this.openItemModal = (orderId) => {
      this.setState({
        orderId,
      }, (() => this.itemRef.current.click()));
    };
    this.uploaderRef = React.createRef();
    this.itemRef = React.createRef();

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const status = ['pending', 'received', 'ontheway'];
    if (this.formRef.current !== null) {
      this.formRef.current.setFieldsValue({
        status,
      });
    }

    this.fetchData({
      pageSize: 500,
      page: 0,
    });
    window.addEventListener('resize', this.updateDimensions);
    this.setCustomInterval();
    this.updateDimensions();
  }

  componentWillUnmount() {
    this.clearCustomInterval();
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    const {
      loading, data, entry,
      orderId, pagination, isMobile,
    } = this.state;
    return (
      <>
        <Form
          onValuesChange={this.onValuesChange}
          ref={this.formRef}
        >
          <Row gutter={10}>
            <Col lg={12} md={12} sm={24} xs={24}>
              <Form.Item
                name="date"
                initialValue={[moment(moment(), dateFormat), moment(moment(), dateFormat)]}
              >
                <DatePicker.RangePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  allowClear={false}
                  inputReadOnly={isMobile}
                />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={24} xs={24}>
              <Form.Item name="status">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select Status"
                  optionLabelProp="label"
                >
                  <Option value="pending" style={{ color: '#ffc069' }}>Pending</Option>
                  <Option value="received" style={{ color: '#36cfc9' }}>Recived</Option>
                  <Option value="ontheway" style={{ color: '#52c41a' }}>On the way</Option>
                  <Option value="completed" style={{ color: '#52c41a' }}>Completed</Option>
                  <Option value="canceled" style={{ color: '#cf1322' }}>Canceled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={8} md={8} sm={24} xs={24}>
              <Form.Item
                name="patient_name"
              >
                <Input
                  prefix={
                    <UserOutlined className="site-form-item-icon" />
                  }
                  placeholder="Enter Patient name..."
                />
              </Form.Item>
            </Col>
            <Col lg={8} md={8} sm={24} xs={24}>
              <Form.Item
                name="patient_phone"
              >
                <Input
                  size="middle"
                  placeholder="Enter Patient's phone number"
                  addonBefore={(
                    <Form.Item name="country_code" noStyle initialValue="964">
                      <Select>
                        <Select.Option value="964">964</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col lg={4} md={4} sm={24} xs={24}>
              <Form.Item
                name="city"
              >
                <RemoteSelect
                  endpoint="/admin/city/list?limit=10&offset=0"
                  optiontext={(op) => op.name_en}
                  placeholder="Select city"
                />
              </Form.Item>
            </Col>
            <Col lg={4} md={4} sm={24} xs={24}>
              <Form.Item
                name="provider"
              >
                <RemoteSelect
                  endpoint="/admin/provider/list?limit=10&offset=0"
                  optiontext={(op) => op.name_en}
                  placeholder="Select provider"
                />
              </Form.Item>
            </Col>
          </Row>

        </Form>
        <div style={{ position: 'relative' }}>
          <div className="loadingBar" style={{ display: !loading ? 'none' : undefined }} />
          <Table
            columns={this.columns}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={pagination}
            onChange={this.handleTableChange}
          />
        </div>
        <Modal
          size="modal-md"
          btnRef={this.uploaderRef}
        >
          <ResultUploader onProviderUpdate={this.fetchData} record={entry} />
        </Modal>
        <Modal
          btnRef={this.itemRef}
          size="modal-lg"
        >
          <OrderItem id={orderId} />
        </Modal>
      </>
    );
  }
}

export default List;
