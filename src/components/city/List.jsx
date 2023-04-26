import React, { Component } from 'react';
import {
  Table, Button,
  Row, Col, Popconfirm,
  notification,
} from 'antd';

import {
  CheckOutlined,
  CloseOutlined,
  FormOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import qs from 'qs';

import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';
import Modal from '../basic/Modal';
import New from './New';
import EditPerson from './Edit';

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
      const active = value.active === 1 ? 0 : 1;
      superagent
        .patch(`/admin/city/${value.id}`)
        .send({ active })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };

    this.delete = (Id) => {
      superagent
        .patch(`/admin/city/${Id}`)
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
        title: 'English name',
        dataIndex: 'name_en',
        key: 'name_en',
        ...this.getColumnSearchProps('name_en'),
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Kurdish name',
        dataIndex: 'name_ku',
        key: 'name_ku',
        ...this.getColumnSearchProps('name_ku'),
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        render: (value) => (
          <div>{value || '---'}</div>
        ),
      },
      {
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
        sorter: true,
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
        .get(`/admin/city/grid?${qs.stringify(params)}`)
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
    this.newBtn = React.createRef();

    this.editBtn = React.createRef();
    this.editBtnClicked = async (id) => {
      await this.setState({
        editResourceId: id,
      });
      this.editBtn.current.click();
    };
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
          size="modal-md"
          header="Add City"
        >
          <New reloadGrid={this.fetchData} />
        </Modal>

        <Modal
          btnRef={this.editBtn}
          header="Edit City"
          size="modal-md"
          onMount={(show, close) => {
            this.closeAvatarModal = close;
          }}
        >
          <EditPerson
            resourceId={editResourceId}
            reloadGrid={this.fetchData}
          />
        </Modal>

        <Row gutter={[0, 10]}>
          <Col md={3} sm={6} xs={8} align="left">
            <Button
              block
              type="primary"
              onClick={this.newBtnClicked}
              icon={<PlusOutlined />}
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
          scroll={{ x: 700 }}
        />
      </div>
    );
  }
}

export default List;
