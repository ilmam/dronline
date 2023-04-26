import React, { Component } from 'react';
import {
    Table, Row, Form, Select,
    Col, DatePicker, Input,
    notification, Modal as AntModal,
} from 'antd';
import {
    UserOutlined,
    MedicineBoxOutlined,
    MobileOutlined,
} from '@ant-design/icons';

import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import debounce from 'lodash/debounce';
import Modal from '../basic/Modal';
import RemoteSelect from '../basic/RemoteSelect';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';
import './visit.css';
import PatientInformation from './PatientInformation';
import DocInformation from './DocInformation';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '50', '100'];

class List extends Component {
    constructor() {
        const status = {
            '/visit': ['scheduled', 'approved', 'attended', 'with-doctor', 'missed'],
            '/telemedicine-visit': ['scheduled', 'approved']
        }[window.location.pathname];

        super();
        this.initialState = () => ({
            loading: true,
            data: [],
            pagination: {
                pageSize: parseInt(pageSizeOptions[4], 10),
                pageSizeOptions,
                current: 1,
                total: 0,
                showSizeChanger: true,
                hideOnSinglePage: false,
                showQuickJumper: true,
            },
            filteredInfo: null,
            sortedInfo: null,
            docId: undefined,
            patientId: undefined,
            type: {
                '/visit': 'clinic-visit',
                '/telemedicine-visit': 'telemedicine-visit',
            }[window.location.pathname],
            status: status
        });
        this.state = this.initialState();
        resetTableFilters(this);
        textColumnSearchPanel(this);
        selectColumnSearchPanel(this);

        this.columns = [
            {
                title: '#',
                dataIndex: 'id',
                key: 'id',
                sorter: true,
                render: (value, record) => (
                    <>
                        {value}
                        {' '}
                        {record.source === 'clinic' ? <MedicineBoxOutlined /> : <MobileOutlined />}
                    </>
                ),
            },
            {
                title: 'Doctor',
                dataIndex: 'doctor_name_en',
                key: 'doctor_name_en',
                render: (record, values) => (
                    <div
                        style={{ cursor: 'pointer' }}
                        role="button"
                        aria-hidden="true"
                        onClick={() => this.getDoctor(values.doctor_id)}
                    >
                        {record || '---'}
                    </div>
                ),
            },
            {
                title: 'Patient',
                dataIndex: 'patient_name',
                key: 'patient_name',
                render: (record, values) => (
                    <div
                        style={{ cursor: 'pointer' }}
                        role="button"
                        aria-hidden="true"
                        onClick={() => this.getPatient(values.patient_id)}
                    >
                        {record || '---'}
                        {
                            values.patient_visits <= 3 ? (
                                <span style={{
                                    position: 'relative',
                                    left: 3,
                                    padding: '2px 5px',
                                    fontSize: 10,
                                    color: '#fff',
                                    background: '#ff7a45',
                                    borderRadius: 30,
                                }}
                                >
                                    New
                                </span>
                            ) : null
                        }
                        {
                            values.is_sub_patient == 1 ? (
                                <span style={{
                                    position: 'relative',
                                    left: 5,
                                    padding: '2px 5px',
                                    fontSize: 10,
                                    color: '#fff',
                                    background: '#4caf50',
                                    borderRadius: 30,
                                }}
                                >
                                    Sub
                                </span>
                            ) : null
                        }
                    </div>
                ),
            },
            {
                title: 'Doctor Specialty',
                dataIndex: 'doctor_speciality_name_en',
                key: 'doctor_speciality_name_en',
                render: (value) => (
                    value === null ? null : JSON.parse(value).map(x => <span style={{
                        marginRight: 5,
                        padding: '2px 5px',
                        fontSize: 10,
                        color: '#fff',
                        background: '#00bcd4',
                        borderRadius: 30,
                    }}>{x}</span>)
                ),
            },
            {
                title: 'Patient number',
                dataIndex: 'patient_phone_no',
                key: 'patient_phone_no',
                render: (value) => (<div>{value.slice(3)}</div>),
            },
            {
                title: 'Visit type',
                dataIndex: 'visit_type_name_en',
                key: 'visit_type_name_en',
            },
            {
                title: 'Visit date',
                dataIndex: 'visit_date',
                key: 'visit_date',
                render: (value) => (
                    <div>{moment(value).format('YYYY-MM-DD')}</div>
                ),
            },
            {
                title: 'Visit status',
                dataIndex: 'visit_status',
                key: 'visit_status',
                width: 200,
                render: (record, values) => (
                    <>
                        <Select
                            value={record}
                            bordered={false}
                            style={{ width: '100%' }}
                            onChange={(selectedValue) => this.onStatusChange(selectedValue, values)}
                            disabled={
                                values.visit_status === 'completed'
                                || values.visit_status === 'canceled'
                            }
                        >
                            <Option value="scheduled"><span style={{ color: '#ffc069' }}>Scheduled</span></Option>
                            <Option value="approved"><span style={{ color: '#36cfc9' }}>Approved</span></Option>

                            {this.state.type === 'clinic-visit' ? (
                                <Option value="attended"><span style={{ color: '#52c41a' }}>Attended</span></Option>
                            ) : (null)}
                            {this.state.type === 'clinic-visit' ? (
                                <Option value="with-doctor"><span style={{ color: '#1890ff' }}>With Doctor</span></Option>
                            ) : (null)}
                            {this.state.type === 'clinic-visit' ? (
                                <Option value="missed"><span style={{ color: '#f5222d' }}>Missed</span></Option>
                            ) : (null)}

                            <Option value="completed"><span style={{ color: '#52c41a' }}>Completed</span></Option>
                            <Option value="canceled"><span style={{ color: '#cf1322' }}>Canceled</span></Option>
                        </Select>
                    </>
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
            const formData = this.formRef.current.getFieldValue();
            const { pagination, filteredInfo, sortedInfo } = this.state;
            const phoneNo = `${formData.country_code}${formData.patient_phone}`;
            const params = {
                sorted: [],
                filtered: [],
                pageSize: pagination.pageSize,
                page: pagination.current - 1,
                from_visit_date: moment().format(dateFormat),
                to_visit_date: moment().format(dateFormat),
                visit_status: status.join(','),
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

            if (formData.visit_date) {
                params.from_visit_date = moment(formData.visit_date).format(dateFormat);
                params.to_visit_date = moment(formData.visit_date).format(dateFormat);
            } else {
                params.from_visit_date = moment(formData.visit_date).format(dateFormat);
                params.to_visit_date = moment(formData.visit_date).format(dateFormat);
            }
            if (formData.slot) {
                params.slot = formData.slot;
            }
            if (formData.doctor_name) {
                params.doctor_id = formData.doctor_name.key;
            }
            if (formData.patient_name) {
                params.patient_name = formData.patient_name;
            }
            if (formData.patient_phone) {
                params.patient_phone = phoneNo;
            }
            if (formData.visit_status) {
                params.visit_status = formData.visit_status.join(',');
            }

            params.type = this.state.type;

            superagent
                .get(`/admin/visit/grid?${qs.stringify(params)}`)
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
        this.onValuesChange = debounce(() => {
            this.fetch();
        }, 300);

        this.onStatusChange = (selectedValue, values) => {
            if (selectedValue === 'missed' || selectedValue === 'completed' || selectedValue === 'canceled') {
                const c = this;
                AntModal.confirm({
                    title: `Are you sure about changing [${values.visit_status}] to [${selectedValue}] !`,
                    okText: 'Yes',
                    centered: 'centered',
                    onOk() {
                        superagent
                            .patch(`/admin/visit/${values.id}`)
                            .send({ visit_status: selectedValue })
                            .end((err) => {
                                if (!err) {
                                    c.fetch();
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
                });
            }
            else if (selectedValue === 'approved' && this.state.type === 'telemedicine-visit') {
                const c = this;
                AntModal.confirm({
                    title: `This will schedule a meeting. Are you sure you want to continue?`,
                    okText: 'confirm',
                    centered: 'centered',
                    onOk() {
                        superagent
                            .patch(`/admin/visit/${values.id}`)
                            .send({ visit_status: selectedValue })
                            .end((err) => {
                                if (!err) {
                                    c.fetch();
                                    notification.success({
                                        placement: 'bottomRight',
                                        message: 'Success',
                                        description: 'A meeting has been scheduled...',
                                        duration: 4,
                                    });
                                }
                            });
                    },
                    onCancel() { },
                });
            }
            else {
                superagent
                    .patch(`/admin/visit/${values.id}`)
                    .send({ visit_status: selectedValue })
                    .end((err) => {
                        if (!err) {
                            this.fetch();
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

        this.setCustomInterval = () => {
            this.IntervalRef = setInterval(this.fetch, 20000);
        };
        this.clearCustomInterval = () => {
            clearInterval(this.IntervalRef);
        };
        this.updateDimensions = debounce(() => {
            this.setState({ windowsWidth: window.innerWidth });
            const { windowsWidth } = this.state;
            if (windowsWidth < 992) {
                this.setState({ isMobile: true });
            } else {
                this.setState({ isMobile: false });
            }
        }, 300);
        this.getDoctor = (id) => {
            this.setState({ docId: id });
            this.showDocRef.current.click();
        };
        this.getPatient = (id) => {
            this.setState({ patientId: id });
            this.showPaitentRef.current.click();
        };
        this.formRef = React.createRef();
        this.showDocRef = React.createRef();
        this.showPaitentRef = React.createRef();
    }

    componentDidMount() {
        if (this.formRef.current !== null) {
            this.formRef.current.setFieldsValue({
                visit_date: moment(),
                visit_status: this.state.status,
            });
        }
        this.fetch();
        this.setCustomInterval();
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        this.clearCustomInterval();
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const {
            data, pagination, loading, docId, patientId,
            isMobile,
        } = this.state;
        return (
            <div>
                <Modal
                    btnRef={this.showDocRef}
                    header="Doctor info"
                    size="modal-md"
                >
                    <DocInformation doctorId={docId} />
                </Modal>
                <Modal
                    btnRef={this.showPaitentRef}
                    header="Patient info"
                    size="modal-md"
                >
                    <PatientInformation patientId={patientId} />
                </Modal>

                <Col span={24}>
                    <Form
                        onValuesChange={this.onValuesChange}
                        ref={this.formRef}
                    >
                        <Row gutter={10}>
                            <Col lg={6} md={8} sm={8} xs={24}>
                                <Form.Item
                                    name="visit_date"
                                >
                                    <DatePicker
                                        format={dateFormat}
                                        style={{ width: '100%' }}
                                        allowClear={false}
                                        inputReadOnly={isMobile}
                                    />
                                </Form.Item>
                            </Col>
                            <Col lg={18} md={16} sm={16} xs={24}>
                                <Form.Item name="visit_status">
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="select status"
                                        optionLabelProp="label"
                                    >
                                        <Option value="scheduled"><span style={{ color: '#ffc069' }}>Scheduled</span></Option>
                                        <Option value="approved"><span style={{ color: '#36cfc9' }}>Approved</span></Option>

                                        {this.state.type === 'clinic-visit' ? (
                                            <Option value="attended"><span style={{ color: '#52c41a' }}>Attended</span></Option>
                                        ) : (null)}
                                        {this.state.type === 'clinic-visit' ? (
                                            <Option value="with-doctor"><span style={{ color: '#1890ff' }}>With Doctor</span></Option>
                                        ) : (null)}
                                        {this.state.type === 'clinic-visit' ? (
                                            <Option value="missed"><span style={{ color: '#f5222d' }}>Missed</span></Option>
                                        ) : (null)}

                                        <Option value="completed"><span style={{ color: '#52c41a' }}>Completed</span></Option>
                                        <Option value="canceled"><span style={{ color: '#cf1322' }}>Canceled</span></Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={10}>
                            <Col md={6} sm={12} xs={24}>
                                <Form.Item
                                    name="doctor_name"
                                >
                                    <RemoteSelect
                                        endpoint="/admin/doctor/list"
                                        optiontext={(op) => (op.name_en)}
                                        placeholder="Search for doctor"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={6} sm={12} xs={24}>
                                <Form.Item
                                    name="patient_name"
                                >
                                    <Input
                                        prefix={
                                            <UserOutlined className="site-form-item-icon" />
                                        }
                                        placeholder="Enter patient name..."
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={12} sm={24} xs={24}>
                                <Form.Item
                                    name="patient_phone"
                                >
                                    <Input
                                        size="middle"
                                        placeholder="Enter patient's phone number"
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
                        </Row>

                    </Form>
                </Col>
                <div style={{ position: 'relative' }}>
                    <div className="loadingBar" style={{ display: !loading ? 'none' : undefined }} />
                    <Table
                        columns={this.columns}
                        rowKey={(record) => record.id}
                        dataSource={data}
                        pagination={pagination}
                        onChange={this.handleTableChange}
                        scroll={{ x: 1000 }}
                    />
                </div>
                <AntModal>
                </AntModal>
            </div>
        );
    }
}

export default List;
