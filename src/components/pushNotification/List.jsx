import React, { Component } from 'react';

import {
    Table, Button, Col, Row, Popover,
    Space, Avatar, Typography, DatePicker,
    Switch, Form, Input, Select,
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
} from '@ant-design/icons';

import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import debounce from 'lodash/debounce';
import CommunicationForm from './Form';
import Modal from '../basic/Modal';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';

const { Option } = Select;
const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '40'];
const dateFormat = 'YYYY-MM-DD';

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
            editItem: undefined,
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
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                //...this.getColumnSearchProps('name'),
                render: (record, object) => (
                    <Space>
                        <Typography.Text>
                            {record || '---'}
                        </Typography.Text>
                    </Space>
                ),

            },
            {
                title: 'Last Updated',
                dataIndex: 'updated_at',
                key: 'updated_at',
                //...this.getDateColumnSearchProps('updated_at'),
                render: (value) => (
                    <div>{moment(value).format('YYYY-MM-DD HH:mm')}</div>
                ),
            },
            {
                title: 'Confirm Date',
                dataIndex: 'sent_at',
                key: 'updated_at',
                //...this.getDateColumnSearchProps('sent_at'),
                render: (value) => (
                    <div>{!value ? '' : moment(value).format('YYYY-MM-DD HH:mm')}</div>
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
                            icon={<EditOutlined />}
                            onClick={() => this.editBtnClicked(record)}
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

        this.openNewModal = () => {
            this.newBtnRef.current.click();
        };

        this.newBtnRef = React.createRef();

        this.fetchData = () => {
            this.setState({ loading: true });
            const {
                pagination, filteredInfo, sortedInfo, formVals,
            } = this.state;
            const params = {
                sorted: [],
                filtered: [],
                sent_at_from:null,
                sent_at_to:null,
                pageSize: pagination.pageSize,
                page: pagination.current - 1,
            };

            if (formVals) {
                if (formVals.name) {
                    params.filtered.push(`name:${formVals.name}`);
                }
                if (formVals.sent_at) {
                    params.sent_at_from = moment(formVals.sent_at[0]).format(dateFormat);
                    params.sent_at_to = moment(formVals.sent_at[1]).format(dateFormat);
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
                .get(`/admin/communication/grid?${qs.stringify(params)}`)
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

        this.editBtn = React.createRef();

        this.editBtnClicked = async (data) => {
            await this.setState({
                editItem: data,
            });
            this.editBtn.current.click();
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
            editItem,
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

                <Col md={3} sm={6} xs={8} align="left">
                    <Button
                        block
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 25 }}
                        onClick={this.openNewModal}
                    >
                        New
                    </Button>
                </Col>

                <Col span={24}>
                    <Form
                        name="basic"
                        layout="vertical"
                        onValuesChange={this.onValuesChange}
                    >
                        <Row gutter={10}>
                            <Col md={12} xs={24}>
                                <Form.Item name="name" label="Name">
                                    <Input
                                        autoComplete="off"
                                        placeholder="Search by Name"
                                    />
                                </Form.Item>
                            </Col>

                            <Col md={12} sm={24} xs={24}>
                                <Form.Item
                                    label="Sent Date"
                                    name="sent_at"
                                >
                                    <DatePicker.RangePicker
                                        format={dateFormat}
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
                    header="Edit Communication"
                    size="modal-md"
                    onMount={(show, close) => {
                        this.closeAvatarModal = close;
                    }}
                >
                    <CommunicationForm
                        item={editItem}
                        reloadGrid={this.fetchData}
                    />
                </Modal>

                <Modal
                    btnRef={this.newBtnRef}
                    header="New Communicatio"
                    size="modal-md"
                    onMount={(show, close) => {
                        this.closeAvatarModal = close;
                    }}
                >
                    <CommunicationForm
                        reloadGrid={this.fetchData}
                    />
                </Modal>


            </>
        );
    }
}

export default List;
