import React, { Component } from 'react';
import {
  Table, Button, Row, Col,
  Space, Avatar,
  Popconfirm, notification,
} from 'antd';

import {
  CheckOutlined,
  CloseOutlined,
  FormOutlined,
  PlusOutlined,
  ExclamationOutlined,
  DeleteOutlined,
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

    this.delete = (Id) => {
      superagent
        .patch(`/admin/article/${Id}`)
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

    this.isActive = (value) => {
      superagent
        .patch(`/admin/article/${value.id}`)
        .send({ active: !value.active })
        .end((err) => {
          if (!err) {
            this.fetchData();
          }
        });
    };
    this.togglePrivate = (value) => {
      superagent
        .patch(`/admin/article/${value.id}`)
        .send({ is_private: !value.is_private })
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
        title: 'Title',
        dataIndex: 'name_en',
        key: 'name_en',
        width: 300,
        ...this.getColumnSearchProps('name_en'),
        render: (record, value) => (
          <Space>
            <div>
              {(value.image_id !== ''
                ? (
                  <Avatar
                    style={{ boxShadow: 'rgb(208 208 208) 0px 0px 5px 1px' }}
                    src={`${process.env.REACT_APP_API_LINK}/files/${value.image_id}`}
                  />
                )
                : (
                  <Avatar
                    style={{ boxShadow: 'rgb(208 208 208) 0px 0px 5px 1px' }}
                    icon={<ExclamationOutlined />}
                  />
                ))}
            </div>
            <div>
              {record}
            </div>
          </Space>
        ),
      },
      {
        title: 'Category name',
        dataIndex: 'category_name_en',
        key: 'category_name_en',
        ellipsis: true,
        ...this.getColumnSearchProps('category_name_en'),
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
        title: 'Private',
        dataIndex: 'is_private',
        key: 'is_private',
        filterMultiple: false,
        align: 'center',
        sorter: true,
        render: (record, value) => (
          <>
            <Button
              type="text"
              shape="round"
              onClick={() => this.togglePrivate(value)}
              icon={record
                ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
            />
          </>
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
        .get(`/admin/article/grid?${qs.stringify(params)}`)
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
          size="modal-lg"
          header="Add new article"
        >
          <New reloadGrid={this.fetchData} />
        </Modal>

        <Modal
          btnRef={this.editBtn}
          header="Edit your article"
          size="modal-lg"
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
          scroll={{ x: 950 }}
        />
      </div>
    );
  }
}

export default List;
