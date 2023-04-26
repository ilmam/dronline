import React, { Component } from 'react';

import {
  Table, Button, Col, Row,
  Space, Avatar, Typography,
  Popconfirm, notification,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Map, TileLayer, Marker,
} from 'react-leaflet';

import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import getAgentInstance from '../../../helpers/superagent';
import textColumnSearchPanel from '../../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../../helpers/resetTableFilters';
import Modal from '../../basic/Modal';
import New from './New';
import Edit from './Edit';

const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '40'];

class ProviderList extends Component {
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
      latitude: 36.1912,
      longitude: 44.0091,
    });
    this.state = this.initialState();

    resetTableFilters(this);
    textColumnSearchPanel(this);
    selectColumnSearchPanel(this);
    dateColumnSearchPanel(this);

    this.isActive = (value) => {
      const active = value.active === 1 ? 0 : 1;
      superagent
        .patch(`/admin/provider/${value.id}`)
        .send({ active })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };

    this.delete = (Id) => {
      superagent
        .patch(`/admin/provider/${Id}`)
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
        title: 'Provider name',
        dataIndex: 'name_en',
        key: 'name_en',
        width: 200,
        ...this.getColumnSearchProps('name_en'),
        render: (record, object) => (
          <Space>
            { object.image_id ? (
              <Avatar src={`${process.env.REACT_APP_API_LINK}/files/${object.image_id}`} />
            ) : <Avatar icon={<UserOutlined />} />}
            <Typography.Text>
              {record || '---'}
            </Typography.Text>
          </Space>
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
        title: 'Address',
        dataIndex: 'address_title',
        key: 'address_title',
        width: '20%',
        ellipsis: { showTitle: true },
        ...this.getColumnSearchProps('address_title'),
        render: (record, values) => (
          <div
            style={{ cursor: 'pointer' }}
            role="button"
            aria-hidden="true"
            onClick={() => this.showMap(values)}
          >
            <div>{record || '---'}</div>
          </div>
        ),
      },
      {
        title: 'Created at',
        dataIndex: 'created_at',
        key: 'created_at',
        ...this.getDateColumnSearchProps('created_at'),
        render: (value) => (
          <div>{moment(value).format('YYYY-MM-DD')}</div>
        ),
      },
      {
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
        filterMultiple: false,
        align: 'center',
        sorter: true,
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
        fixed: 'right',
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
        .get(`/admin/provider/grid?${qs.stringify(params)}`)
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

    // custom refs
    this.newBtnClicked = () => {
      this.newBtn.current.click();
    };
    this.showMap = (record) => {
      this.setState({
        latitude: record.latitude,
        longitude: record.longitude,
      }, () => {
        this.showMapRef.current.click();
      });
    };
    this.editBtnClicked = async (id) => {
      await this.setState({
        editResourceId: id,
      });
      this.editBtn.current.click();
    };
    this.showMapRef = React.createRef();
    this.newBtn = React.createRef();
    this.editBtn = React.createRef();
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const {
      data, pagination, loading, editResourceId,
      latitude, longitude,
    } = this.state;
    const lockedPosition = [latitude, longitude];
    return (
      <>

        <Modal
          btnRef={this.showMapRef}
          size="modal-md"
          header="Map"
        >
          <div style={{ margin: '-24px -24px -48px -24px' }}>
            <Map
              ref={this.mapRef}
              style={{ height: '400px' }}
              center={lockedPosition}
              zoom={13}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={lockedPosition}
              />
            </Map>
          </div>
        </Modal>

        <Modal
          btnRef={this.newBtn}
          size="modal-lg"
          header="Add Provider"
        >
          <New reloadGrid={this.fetchData} />
        </Modal>

        <Modal
          btnRef={this.editBtn}
          header="Edit Provider"
          size="modal-lg"
        >
          <Edit
            resourceId={editResourceId}
            reloadGrid={this.fetchData}
          />
        </Modal>
        <Row gutter={[0, 10]}>
          <Col md={3} sm={6} xs={8} align="left">
            <Button
              block
              type="primary"
              icon={<PlusOutlined />}
              onClick={this.newBtnClicked}
            >
              New
            </Button>
          </Col>
        </Row>

        <Table
          columns={this.columns}
          rowKey={(record) => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
          scroll={{ x: 900 }}
        />
      </>
    );
  }
}

export default ProviderList;
