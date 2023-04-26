import React, { Component } from 'react';

import {
  Table, Button, Col, Row, Popover,
  Popconfirm, notification, Form,
  List,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';

import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';

import New from './New';
import Modal from '../../basic/Modal';
import RemoteSelect from '../../basic/RemoteSelect';
import getAgentInstance from '../../../helpers/superagent';
import textColumnSearchPanel from '../../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../../helpers/resetTableFilters';

const dateFormat = 'YYYY-MM-DD';
const superagent = getAgentInstance();
const pageSizeOptions = ['10', '20', '25', '30', '40'];

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
    });
    this.state = this.initialState();

    resetTableFilters(this);
    textColumnSearchPanel(this);
    selectColumnSearchPanel(this);
    dateColumnSearchPanel(this);

    this.delete = (Id, patientId) => {
      superagent
        .patch(`/admin/patient/testresult/${Id}`)
        .send({ deleted: 1 })
        .end((err) => {
          if (!err) {
            this.fetchData(patientId);
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
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        ...this.getColumnSearchProps('title'),
        render: (record) => <div>{ record || '---'}</div>,
      },
      {
        title: 'Note',
        dataIndex: 'note',
        key: 'note',
        ellipsis: { showTitle: true },
        ...this.getColumnSearchProps('note'),
        render: (record) => <div>{record || '---'}</div>,
      },
      {
        title: 'Attachments',
        align: 'center',
        width: 120,
        render: (object) => (
          <Popover
            title={(
              <div>
                Attachment #
                {object.id}
              </div>
            )}
            trigger="click"
            content={(
              <>
                <List bordered>
                  {object.result ? object.result.split(',').map((attachment) => (
                    <List.Item key={Math.random()}>
                      <a href={`${process.env.REACT_APP_API_LINK}/files/${attachment}`} rel="noreferrer" target="_blank">{attachment}</a>
                    </List.Item>
                  )) : null}
                </List>
              </>
            )}
          >
            <Button
              type="text"
              shape="round"
              icon={<PaperClipOutlined />}
            />
          </Popover>
        ),
      },
      {
        title: 'Created at',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        ...this.getDateColumnSearchProps('created_at'),
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
        title: 'Actions',
        align: 'center',
        width: 100,
        render: (object) => (
          <Button.Group size="middle">
            <Popconfirm
              title={`Are you sure delete [${object.title}]`}
              onConfirm={() => { this.delete(object.id, object.patient_id); }}
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

    this.fetchData = (id) => {
      this.setState({ loading: true });
      const { pagination, filteredInfo, sortedInfo } = this.state;
      const params = {
        sorted: [],
        filtered: [],
        patient_id: id,
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
        .get(`/admin/patient/testresult/grid?${qs.stringify(params)}`)
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

    this.onFormChange = (v, allValues) => {
      const patientId = allValues.patient_id ? allValues.patient_id.key : 0;
      this.setState({ patientId }, () => {
        this.fetchData(patientId);
      });
    };

    // custom refs
    this.newBtnClicked = () => {
      this.newBtn.current.click();
    };
    this.newBtn = React.createRef();
    this.formRef = React.createRef();
  }

  render() {
    const {
      data, pagination, loading, patientId,
    } = this.state;
    return (
      <>

        <Modal
          btnRef={this.newBtn}
          size="modal-md"
          header="Add New Result"
        >
          <New reloadGrid={this.fetchData} patientId={patientId} />
        </Modal>

        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : 'initial',
          }}
          ref={this.formRef}
          onValuesChange={this.onFormChange}
        >
          <Row gutter={10}>
            <Col md={3} sm={6} xs={24} align="left">
              <Button
                block
                type="primary"
                icon={<PlusOutlined />}
                onClick={this.newBtnClicked}
                disabled={!patientId}
              >
                New
              </Button>
            </Col>

            <Col md={9} sm={18} xs={24}>
              <Form.Item
                name="patient_id"
              >
                <RemoteSelect
                  endpoint="/admin/patient/list"
                  optiontext={(op) => `${op.name} (${op.phone_no.replace('964', '0')}) / ${op.code}`}
                  placeholder="Select a patient"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

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
