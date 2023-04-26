import React, { Component } from 'react';
import {
  Table, Button, Row, Col,
} from 'antd';

import {
  CheckOutlined,
  CloseOutlined,
  FormOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import qs from 'qs';

import moment from 'moment';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';
import Modal from '../basic/Modal';
import New from './New';
import Edit from './Edit';

const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '40'];

class List extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
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
        .patch(`/admin/visittype/${value.id}`)
        .send({ active })
        .end((err) => {
          if (!err) {
            this.fetchData();
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
        title: 'Created at',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value) => (<div>{moment(value).format('YYYY-MM-DD')}</div>),
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
        width: 100,
        render: (object) => (
          <Button.Group size="middle">
            <Button
              onClick={() => this.editBtnClicked(object.id)}
              type="dashed"
              icon={<FormOutlined />}
              shape="round"
            />
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
        .get(`/admin/visittype/grid?${qs.stringify(params)}`)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            pagination.total = body.records;
            this.setState({
              data: body.data,
              pagination,
            });
          } else {
            this.setState(this.initialState());
          }
          this.setState({ loading: false });
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
          header="Add visit type"
        >
          <New reloadGrid={this.fetchData} />
        </Modal>

        <Modal
          btnRef={this.editBtn}
          header="Edit Visit type"
          size="modal-md"
          onMount={(show, close) => {
            this.closeAvatarModal = close;
          }}
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
          scroll={{ x: 700 }}
        />
      </div>
    );
  }
}

export default List;
