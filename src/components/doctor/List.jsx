import React, { Component } from 'react';
import {
    Table, Button, Row,
    Col, Popover, Switch,
    Space, Avatar, Typography,
    Form, Input, Select, DatePicker,
} from 'antd';

import {
    ReconciliationOutlined,
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    FormOutlined,
    PlusOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import qs from 'qs';
import debounce from 'lodash/debounce';
import moment from 'moment';

import New from './New';
import EditPerson from './Edit';
import Modal from '../basic/Modal';
import RemoteSelect from '../basic/RemoteSelect';
import getAgentInstance from '../../helpers/superagent';
import SendNotification from '../patient/SendNotification';
import resetTableFilters from '../../helpers/resetTableFilters';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import dateColumnSearchPanel from '../../helpers/dateColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';

const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '40'];
const { Option } = Select;

class List extends Component {
    constructor() {
        super();
        this.initialState = () => ({
            loading: false,
            data: [],
            formVals: {},
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
                title: 'Doctor',
                dataIndex: 'name_en',
                key: 'name_en',
                width: 200,
                ...this.getColumnSearchProps('name_en'),
                render: (record, object) => (
                    <Space>
                        {object.image_id !== '' ? (
                            <Avatar src={`${process.env.REACT_APP_API_LINK}/files/${object.image_id}`} />
                        ) : <Avatar icon={<UserOutlined />} />}

                        {object.verified && !object.blocked
                            ? <div className="customBadge" style={{ background: '#52c41a' }} />
                            : <div className="customBadge" style={{ background: '#ff4d4f' }} />}
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
                title: 'Registered at',
                dataIndex: 'created_at',
                key: 'created_at',
                ...this.getDateColumnSearchProps('created_at'),
                render: (value) => (
                    <div>{moment(value).format('YYYY-MM-DD')}</div>
                ),
            },
            {
                title: 'Cinic',
                dataIndex: 'clinic_name_en',
                key: 'clinic_name_en',
                ...this.getDateColumnSearchProps('clinic_name_en'),
                ellipsis: true,
                render: (value) => (
                    <div>{value || '---'}</div>
                ),
            },
            {
                title: 'Address',
                dataIndex: 'address_title_en',
                key: 'address_title',
                ...this.getDateColumnSearchProps('address_title_en'),
                render: (value) => (
                    <div>{value || '---'}</div>
                ),
            },
            {
                title: 'Actions',
                align: 'center',
                render: (record) => (
                    <Button.Group size="middle">
                        {record.fcm_token ? (
                            <Button
                                type="dashed"
                                shape="round"
                                icon={<MessageOutlined />}
                                onClick={() => this.sendNotifications(record)}
                            />
                        ) : null}
                        <Button
                            onClick={() => this.editBtnClicked(record.id)}
                            type="dashed"
                            icon={<FormOutlined />}
                            shape="round"
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

                                    <Row className="SwichContainer">
                                        <Col span={12}>
                                            Consultancy:
                                        </Col>
                                        <Col span={12} style={{ textAlign: 'end' }}>
                                            <Switch
                                                defaultChecked={record.have_consultancy}
                                                onChange={() => this.haveConsultancy(record)}
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="SwichContainer">
                                        <Col span={12}>
                                            Badge:
                                        </Col>
                                        <Col span={12} style={{ textAlign: 'end' }}>
                                            <Switch
                                                defaultChecked={record.have_badge}
                                                onChange={() => this.haveBadge(record)}
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="SwichContainer">
                                        <Col span={12}>
                                            Training:
                                        </Col>
                                        <Col span={12} style={{ textAlign: 'end' }}>
                                            <Switch
                                                defaultChecked={record.received_training}
                                                onChange={() => this.receivedTraining(record)}
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="SwichContainer">
                                        <Col span={12}>
                                            International Telemedicine:
                                        </Col>
                                        <Col span={12} style={{ textAlign: 'end' }}>
                                            <Switch
                                                defaultChecked={record.international_telemedicine}
                                                onChange={() => this.internationalTelemedicine(record)}
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="SwichContainer">
                                        <Col span={12}>
                                            Booking:
                                        </Col>
                                        <Col span={12} style={{ textAlign: 'end' }}>
                                            <Switch
                                                defaultChecked={record.has_booking}
                                                onChange={() => this.has_booking(record)}
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}
                        >
                            <Button type="dashed" shape="round" icon={<ReconciliationOutlined />} />
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
                () => this.fetch(),
            );
        };
        this.fetch = () => {
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
            // params.filtered.push('package.name_ku:1');
            // eslint-disable-next-line no-unused-expressions
            if (formVals.name_en) {
                params.filtered.push(`name_en:${formVals.name_en}`);
            }
            if (formVals.have_consultancy === 'unset') {
                //
            } else if (formVals.have_consultancy === true || formVals.have_consultancy === false) {
                params.filtered.push(`have_consultancy:${formVals.have_consultancy === true ? 1 : 0}`);
            }
            if (formVals.blocked === 'unset') {
                //
            } else if (formVals.blocked === true || formVals.blocked === false) {
                params.filtered.push(`blocked:${formVals.blocked === true ? 1 : 0}`);
            }
            if (formVals.verified === 'unset') {
                //
            } else if (formVals.verified === true || formVals.verified === false) {
                params.filtered.push(`verified:${formVals.verified === true ? 1 : 0}`);
            }
            if (formVals.have_badge === 'unset') {
                //
            } else if (formVals.have_badge === true || formVals.have_badge === false) {
                params.filtered.push(`have_badge:${formVals.have_badge === true ? 1 : 0}`);
            }

            if (formVals.received_training === 'unset') {
                //
            } else if (formVals.received_training === true || formVals.received_training === false) {
                params.filtered.push(`received_training:${formVals.received_training === true ? 1 : 0}`);
            }

            if (formVals.international_telemedicine === 'unset') {
                //
            } else if (formVals.international_telemedicine === true || formVals.international_telemedicine === false) {
                params.filtered.push(`international_telemedicine:${formVals.international_telemedicine === true ? 1 : 0}`);
            }

            if (formVals.has_booking === 'unset') {
                //
            } else if (formVals.has_booking === true || formVals.has_booking === false) {
                params.filtered.push(`has_booking:${formVals.has_booking === true ? 1 : 0}`);
            }

            if (formVals.created_at) {
                params.filtered.push(`created_at:${formVals.created_at.format('YYYY-MM-DD')}`);
            }
            if (formVals.phone_no) {
                params.filtered.push(`phone_no:${formVals.country_code}${formVals.phone_no}`);
            }
            if (formVals.city_id) {
                params.filtered.push(`city_id:${formVals.city_id.key}`);
            }
            if (formVals.country_id) {
                params.filtered.push(`country_id:${formVals.country_id.key}`);
            }
            if (formVals.speciality) {
                params.speciality_id = formVals.speciality.key;
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
                .get(`/admin/doctor/grid?${qs.stringify(params)}`)
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

        this.isVerified = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ verified: !record.verified })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.isBlocked = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ blocked: !record.blocked })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.haveConsultancy = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ have_consultancy: !record.have_consultancy })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.haveBadge = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ have_badge: !record.have_badge })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.receivedTraining = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ received_training: !record.received_training })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.internationalTelemedicine = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ international_telemedicine: !record.international_telemedicine })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.has_booking = (record) => {
            this.setState({ loading: true });
            superagent
                .patch(`/admin/doctor/${record.id}`)
                .send({ has_booking: !record.has_booking })
                .end((err) => {
                    if (!err) {
                        this.fetch();
                    }
                });
        };

        this.onValuesChange = debounce((newVals, allValues) => {
            this.setState({ formVals: allValues }, this.fetch);
        }, 500);
        this.updateDimensions = debounce(() => {
            this.setState({ windowsWidth: window.innerWidth });
            const { windowsWidth } = this.state;
            if (windowsWidth < 992) {
                this.setState({ isMobile: true });
            } else {
                this.setState({ isMobile: false });
            }
        }, 300);

        // custom refs
        this.openNewModal = () => {
            this.newBtnRef.current.click();
        };
        this.newBtnRef = React.createRef();
        this.editBtn = React.createRef();
        this.editBtnClicked = async (id) => {
            await this.setState({
                editResourceId: id,
            });
            this.editBtn.current.click();
        };

        this.sendNotifications = async (data) => {
            await this.setState({
                fcmToken: data.fcm_token,
                rowData: data,
            });
            this.sendNotiicationRef.current.click();
        };
        this.sendNotiicationRef = React.createRef();
    }

    componentDidMount() {
        this.fetch();
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const {
            data, pagination, loading, editResourceId,
            isMobile, fcmToken, rowData,
        } = this.state;
        return (
            <>
                <style>
                    {`
           .SwichContainer {
              padding-bottom: 3px;
              margin-bottom: 10px;
              border-bottom: 1px solid rgb(238, 238, 238);
            }
            .SwichContainer:last-child {
              padding-bottom: 0px;
              margin-bottom: 0px;
              border-bottom: none;
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
                <Modal
                    btnRef={this.editBtn}
                    header="Edit Doctor"
                    size="modal-lg"
                    onMount={(show, close) => {
                        this.closeAvatarModal = close;
                    }}
                >
                    <EditPerson
                        resourceId={editResourceId}
                        reloadGrid={this.fetch}
                    />
                </Modal>
                <Modal
                    btnRef={this.sendNotiicationRef}
                    header={(
                        <>
                            {fcmToken ? (
                                <div>
                                    Send Notification to:
                                    {' '}
                                    {rowData.name_en.charAt(0).toUpperCase() + rowData.name_en.slice(1)}
                                </div>
                            ) : 'Send Notification'}
                        </>
                    )}
                    size="modal-sm"
                >
                    <SendNotification fcmToken={fcmToken} />
                </Modal>
                <Modal
                    btnRef={this.newBtnRef}
                    size="modal-md"
                    header="Add Doctor"
                >
                    <New reloadGrid={this.fetch} />
                </Modal>
                <Row gutter={10}>
                    <Col md={3} sm={6} xs={8} align="left">
                        <Button
                            block
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={this.openNewModal}
                            style={{ marginBottom: 25 }}
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
                                <Col md={6} xs={24}>
                                    <Form.Item
                                        name="phone_no"
                                        label="Phone Number"
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

                                <Col md={6} sm={12} xs={24}>
                                    <Form.Item
                                        name="name_en"
                                        label="Name"
                                    >
                                        <Input
                                            autoComplete="off"
                                            placeholder="Search by English name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col md={6} xs={24}>
                                    <Form.Item
                                        name="have_consultancy"
                                        label="Consultancy"
                                        initialValue="unset"
                                    >
                                        <Select>
                                            <Option value="unset">
                                                Unset
                                            </Option>
                                            <Option value>
                                                Have Consultancy
                                            </Option>
                                            <Option value={false}>
                                                Doesn&apos;t have consultancy
                                            </Option>

                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col md={6} sm={12} xs={24}>
                                    <Form.Item
                                        name="created_at"
                                        label="Registered at"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="YYYY-MM-DD"
                                            inputReadOnly={isMobile}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col md={8} xs={24}>
                                    <Row gutter={10}>
                                        <Col md={12} xs={24}>
                                            <Form.Item
                                                name="city_id"
                                                label="City"
                                            >
                                                <RemoteSelect
                                                    endpoint="/admin/city/list"
                                                    placeholder="Search by city"
                                                    optiontext={(op) => op.name_en}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col md={12} xs={24}>
                                            <Form.Item
                                                name="country_id"
                                                label="Country"
                                            >
                                                <RemoteSelect
                                                    endpoint="/admin/country/list"
                                                    placeholder="Search by country"
                                                    optiontext={(op) => op.name_en}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md={16} xs={24}>
                                    <Row gutter={10}>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="blocked"
                                                label="Blocked"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Blocked
                                                    </Option>
                                                    <Option value={false}>
                                                        Not Blocked
                                                    </Option>

                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="verified"
                                                label="Verified"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Verified
                                                    </Option>
                                                    <Option value={false}>
                                                        Not Verified
                                                    </Option>

                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="have_badge"
                                                label="Badge"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Have Badge
                                                    </Option>
                                                    <Option value={false}>
                                                        No-Badge
                                                    </Option>

                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="received_training"
                                                label="Training"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Have Training
                                                    </Option>
                                                    <Option value={false}>
                                                        No-Training
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md={16} xs={24}>
                                    <Row gutter={10}>
                                        <Col md={6} xs={24}>
                                            <Form.Item
                                                name="speciality"
                                                label="Speciality"

                                            >
                                                <RemoteSelect
                                                    endpoint="/admin/speciality/list"
                                                    optiontext={(r) => r.name_en}
                                                    placeholder="Search by speciality"
                                                />
                                            </Form.Item>

                                        </Col>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="international_telemedicine"
                                                label="International Telemedicine"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Have International Telemedicine
                                                    </Option>
                                                    <Option value={false}>
                                                        Not have International Telemedicine
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col sm={6} xs={24}>
                                            <Form.Item
                                                name="has_booking"
                                                label="Booking"
                                                initialValue="unset"
                                            >
                                                <Select>
                                                    <Option value="unset">
                                                        Unset
                                                    </Option>
                                                    <Option value>
                                                        Has Booking
                                                    </Option>
                                                    <Option value={false}>
                                                        Doesn't have Booking
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                    <Col span={24}>
                        <Table
                            columns={this.columns}
                            rowKey={(record) => record.id}
                            dataSource={data}
                            pagination={pagination}
                            loading={loading}
                            onChange={this.handleTableChange}
                            scroll={{ x: 1070 }}
                        />
                    </Col>
                </Row>
            </>
        );
    }
}

export default List;
