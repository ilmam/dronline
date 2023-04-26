import React, { Component } from 'react';

import {
  Table, Button, Col, Row, Popover,
  Space, Avatar, Typography,
  Switch, Form, Input, Select,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ReconciliationOutlined,
  UserOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';

import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import debounce from 'lodash/debounce';
import Edit from './Edit';
import Modal from '../basic/Modal';
import SendNotification from './SendNotification';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';

const { Option } = Select;
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
    dateColumnSearchPanel(this);

    this.columns = [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        sorter: true,
      },
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'patient.code',
        ...this.getColumnSearchProps('code'),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
        render: (record, object) => (
          <Space>
            { object.image_id ? (
              <Avatar src={`${process.env.REACT_APP_API_LINK}/files/${object.image_id}`} />
            ) : <Avatar icon={<UserOutlined />} />}
            { object.verified && !object.blocked
              ? <div className="customBadge" style={{ background: '#52c41a' }} />
              : <div className="customBadge" style={{ background: '#ff4d4f' }} />}
            <Typography.Text>
              {record || '---'}
            </Typography.Text>
          </Space>
        ),

      },
      {
        title: 'Birthdate',
        dataIndex: 'birthdate',
        key: 'birthdate',
        ...this.getDateColumnSearchProps('birthdate'),
        render: (value) => (
          <div>{moment(value).format('YYYY-MM-DD')}</div>
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'phone_no',
        key: 'phone_no',
        ...this.getColumnSearchProps('phone_no'),
        render: (value) => (
          <div>{value.slice(3) || '---'}</div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        align: 'center',
        ...this.getColumnSearchProps('email'),
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Actions',
        align: 'center',
        render: (record) => (
          <Button.Group size="middle">
            <Button
              type="dashed"
              shape="round"
              icon={<MessageOutlined />}
              onClick={() => this.sendNotifications(record)}
            />
            <Button
              type="dashed"
              shape="round"
              icon={<EditOutlined />}
              onClick={() => this.editBtnClicked(record)}
            />
            <Popover
              title="Manage status"
              trigger="click"
              content={(
                <>
                  <Row className="SwichContainer">
                    <Col span={12}>
                      Verified:
                    </Col>
                    <Col span={12} style={{ textAlign: 'end' }}>
                      <Switch
                        defaultChecked={record.verified}
                        onChange={() => this.isVerified(record)}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                      />
                    </Col>
                  </Row>

                  <Row className="SwichContainer">
                    <Col span={12}>
                      Blocked:
                    </Col>
                    <Col span={12} style={{ textAlign: 'end' }}>
                      <Switch
                        defaultChecked={record.blocked}
                        onChange={() => this.isBlocked(record)}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                      />
                    </Col>
                  </Row>
                </>
              )}
            >
              <Button
                type="dashed"
                shape="round"
                icon={<ReconciliationOutlined />}
              />
            </Popover>
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
      this.setState({ loading: true });
      const {
        pagination, filteredInfo, sortedInfo, formVals,
      } = this.state;
      const params = {
        sorted: [],
        filtered: [],
        pageSize: pagination.pageSize,
        page: pagination.current - 1,
      };

      if (formVals) {
        if (formVals.name) {
          params.filtered.push(`name:${formVals.name}`);
        }

        if (formVals.code) {
          params.filtered.push(`patient.code:${formVals.code}`);
        }

        if (formVals.phone_no) {
          params.filtered.push(`patient.phone_no:${formVals.country_code}${formVals.phone_no}`);
        }
      }

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
        .get(`/admin/patient/grid?${qs.stringify(params)}`)
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
    this.isVerified = (record) => {
      this.setState({ loading: true });
      const isVerified = record.verified === 1 ? 0 : 1;
      superagent
        .patch(`/admin/patient/${record.id}`)
        .send({ verified: isVerified })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };
    this.editBtn = React.createRef();
    this.editBtnClicked = async (data) => {
      await this.setState({
        editResourceId: data.id,
        patientCode: data.code,
      });
      this.editBtn.current.click();
    };
    this.sendNotiicationRef = React.createRef();
    this.sendNotifications = async (data) => {
      await this.setState({
        fcmToken: data.fcm_token,
      });
      this.sendNotiicationRef.current.click();
    };
    this.isBlocked = (record) => {
      this.setState({ loading: true });
      const blocked = record.blocked === 1 ? 0 : 1;
      superagent
        .patch(`/admin/patient/${record.id}`)
        .send({ blocked })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };
    this.isActive = (value) => {
      this.setState({ loading: true });
      const active = value.active === 1 ? 0 : 1;
      superagent
        .patch(`/admin/patient/${value.id}`)
        .send({ active })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };

    this.onValuesChange = debounce((newVals, allValues) => {
      this.setState({ formVals: allValues }, this.fetchData);
    }, 500);
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const {
      data, pagination, loading, fcmToken,
      editResourceId, patientCode,
    } = this.state;
    return (
      <>
        <div>
          <style>
            <style>
              {`
           .SwichContainer {
              padding-bottom: 3px;
              margin-bottom: 10px;
              border-bottom: 1px solid rgb(238, 238, 238);
            }
            .customBadge {
              height: 8px;
              width: 8px;
              right: 16px;
              bottom: -10px;
              position: relative;
              border-radius: 100px;
              box-shadow: rgb(208 208 208) 0px 0px 5px 1px;
            }
        `}
            </style>
          </style>
        </div>

        <Col span={24}>
          <Form
            name="basic"
            layout="vertical"
            onValuesChange={this.onValuesChange}
          >
            <Row gutter={10}>
              <Col md={6} xs={24}>
                <Form.Item name="code">
                  <Input
                    autoComplete="off"
                    style={{ width: '100%' }}
                    placeholder="Search by code"
                  />
                </Form.Item>
              </Col>
              <Col md={9} xs={24}>
                <Form.Item name="name">
                  <Input
                    autoComplete="off"
                    placeholder="Search by name"
                  />
                </Form.Item>
              </Col>
              <Col md={9} xs={24}>
                <Form.Item
                  name="phone_no"
                >
                  <Input
                    autoComplete="off"
                    placeholder="Search by phone number"
                    addonBefore={(
                      <Form.Item name="country_code" noStyle initialValue="964">
                        <Select>
                          <Option value="964">964</Option>
                        </Select>
                      </Form.Item>
                      )}
                    style={{ width: '100%' }}
                  />
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
          scroll={{ x: 1100 }}
        />
        <Modal
          btnRef={this.editBtn}
          header="Edit Patient"
          size="modal-md"
          onMount={(show, close) => {
            this.closeAvatarModal = close;
          }}
        >
          <Edit
            patientCode={patientCode}
            resourceId={editResourceId}
            reloadGrid={this.fetchData}
          />
        </Modal>

        <Modal
          btnRef={this.sendNotiicationRef}
          header="Send Notification"
          size="modal-sm"
        >
          <SendNotification fcmToken={fcmToken} />
        </Modal>
      </>
    );
  }
}

export default List;
