import React, { Component } from 'react';
import {
  Table, Row, Form, Select,
  Col, DatePicker, Tooltip,
  notification,
  Modal as AntModal,
  Button,
} from 'antd';
import {
  FileExcelOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

import TimeAgo from 'react-time-ago';
import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import debounce from 'lodash/debounce';

import './consultation.css';
import Modal from '../basic/Modal';
import getAgentInstance from '../../helpers/superagent';
import textColumnSearchPanel from '../../helpers/textColumnSearchPanel';
import selectColumnSearchPanel from '../../helpers/selectColumnSearchPanel';
import resetTableFilters from '../../helpers/resetTableFilters';
import PatientInformation from '../visit/PatientInformation';
import DocInformation from '../visit/DocInformation';
import RemoteSelect from '../basic/RemoteSelect';
import SendNotification from '../patient/SendNotification';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
const superagent = getAgentInstance();
const pageSizeOptions = ['15', '20', '25', '30', '50', '100'];
const spokenLanguagesEn = ['English', 'Kurdish - Sorani', 'Kurdish - Badini', 'Arabic', 'Turkish', 'Persian', 'Germany', 'French', 'Spanish'];

class List extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      data: [],
      selectedRows: [],
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
      },
      {
        title: 'Doctor',
        dataIndex: 'doctor_name_en',
        key: 'doctor_name_en',
        render: (record, values) => (
          <>
            { record ? (
              <div
                style={{ cursor: 'pointer' }}
                role="button"
                aria-hidden="true"
                onClick={() => this.getDoctor(values.doctor_id)}
              >
                {record}
              </div>
            ) : '---'}
          </>
        ),
      },
      {
        title: 'Patient',
        dataIndex: 'patient_name',
        key: 'patient_name',
        render: (record, values) => (
          <>
            { record ? (
              <div
                style={{ cursor: 'pointer' }}
                role="button"
                aria-hidden="true"
                onClick={() => this.getPatient(values.patient_id)}
              >
                {values.patient_parent_id === values.patient_id ? record : null}
                {values.patient_parent_id !== values.patient_id ? (
                  <Tooltip title="This is a Sub Account">
                    <div>
                      {record}
                      {' '}
                      <span style={{ color: '#f5222d' }}>!</span>
                    </div>
                  </Tooltip>
                ) : null}
              </div>
            ) : '---'}
          </>
        ),
      },
      {
        title: 'Patient phone',
        dataIndex: 'patient_phone_no',
        key: 'patient_phone_no',
        render: (record) => <div>{`${record}`.slice(3) || '---'}</div>,
      },
      {
        title: 'Speciality',
        dataIndex: 'speciality_name_en',
        key: 'speciality_name_en',
        render: (record) => <div>{record || '---'}</div>,
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (v) => (
          <>
            <TimeAgo date={(new Date(v).getTime())} locale="en-US" />
          </>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 200,
        render: (record, values) => (
          <>
            <Select
              value={record}
              bordered={false}
              style={{ width: '100%' }}
              onChange={(selectedValue) => this.onStatusChange(selectedValue, values)}
            >
              <Option value="requested"><span style={{ color: '#1890ff' }}>Requested</span></Option>
              <Option value="accepted"><span style={{ color: '#52c41a' }}>Accepted</span></Option>
              <Option value="rejected"><span style={{ color: '#f5222d' }}>Rejected</span></Option>
              <Option value="closed"><span style={{ color: '#36cfc9' }}>Closed</span></Option>
              <Option value="hidden"><span style={{ color: '#ffa39e' }}>Hidden</span></Option>
              <Option value="misbehaviour"><span style={{ color: '#ffc069' }}>Misbehaviour</span></Option>
              <Option value="active"><span style={{ color: '#52c41a' }}>Active</span></Option>
              <Option value="ignored"><span style={{ color: '#f5222d' }}>Ignored</span></Option>
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
      const params = {
        sorted: [],
        filtered: [],
        pageSize: pagination.pageSize,
        page: pagination.current - 1,
        start_date: moment().add(-1, 'day').endOf('day'),
        end_date: moment().format(dateFormat),
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
        params.start_date = moment(formData.date[0]).format(dateFormat);
        params.end_date = moment(formData.date[1]).format(dateFormat);
      } else {
        params.start_date = moment(formData.date[0]).format(dateFormat);
        params.end_date = moment(formData.date[1]).format(dateFormat);
      }

      if (typeof formData.from_minute === 'number' && typeof formData.to_minute === 'number') {
        // to_minute
        params.from_minute = formData.from_minute;
        params.to_minute = formData.to_minute;
      }
      if (formData.speciality_id) {
        params.filtered.push(`consultation.speciality_id:${formData.speciality_id.key}`);
      }
      if (formData.doctor_id) {
        params.filtered.push(`consultation.doctor_id:${formData.doctor_id.key}`);
      }
      if (formData.spoken_language) {
        params.spoken_language = formData.spoken_language;
      }
      if (formData.city_id) {
        params.filtered.push(`doctor.city_id:${formData.city_id.key}`);
      }
      if (formData.status) {
        params.status = formData.status.join(',');
      }

      superagent
        .get(`/admin/consultancy/grid?${qs.stringify(params)}`)
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
      if (selectedValue === 'closed' || selectedValue === 'rejected' || selectedValue === 'misbehaviour') {
        const c = this;
        AntModal.confirm({
          title: `Are you sure about changing [${values.status}] to [${selectedValue}] !`,
          okText: 'Yes',
          centered: 'centered',
          onOk() {
            superagent
              .patch(`/admin/consultancy/${values.id}`)
              .send({ status: selectedValue })
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
          onCancel() {},
        });
      } else {
        superagent
          .patch(`/admin/consultancy/${values.id}`)
          .send({ status: selectedValue })
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
      this.IntervalRef = setInterval(this.fetch, 30000);
    };
    this.clearCustomInterval = () => {
      clearInterval(this.IntervalRef);
    };
    this.getDoctor = (id) => {
      this.setState({ docId: id });
      this.showDocRef.current.click();
    };
    this.getPatient = (id) => {
      this.setState({ patientId: id });
      this.showPaitentRef.current.click();
    };
    this.generateDownloadableLink = (data, fileName) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName.toString());
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    };
    this.exportToExcel = () => {
      const formData = this.formRef.current.getFieldValue();
      const params = {};
      if (formData.visit_date) {
        params.start_date = moment(formData.date[0]).format(dateFormat);
        params.end_date = moment(formData.date[1]).format(dateFormat);
      } else {
        params.start_date = moment(formData.date[0]).format(dateFormat);
        params.end_date = moment(formData.date[1]).format(dateFormat);
      }

      if (formData.from_minute && formData.to_minute) {
        // to_minute
        params.from_minute = formData.from_minute;
        params.to_minute = formData.to_minute;
      }
      if (formData.speciality_id) {
        params.speciality_id = formData.speciality_id.key;
      }
      if (formData.doctor_id) {
        params.doctor_id = formData.doctor_id.key;
      }
      if (formData.spoken_language) {
        params.spoken_language = formData.spoken_language;
      }
      if (formData.city_id) {
        params.city_id = formData.city_id.key;
      }
      if (formData.status) {
        params.status = formData.status.join(',');
      }
      superagent
        .get('/admin/consultancy/download')
        .query(params)
        .set('Content-Type', 'application/json')
        .responseType('blob')
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            this.generateDownloadableLink(body, 'consultancy-list');
          }
        });
    };
    this.rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows });
      },
      getCheckboxProps: (record) => ({
        // disabled: record.name === 'Disabled User',
        // Column configuration not to be checked
        name: record.id,
      }),
    };
    this.sendNotifications = async () => {
      this.sendNotiicationRef.current.click();
    };
    this.formRef = React.createRef();
    this.showDocRef = React.createRef();
    this.showPaitentRef = React.createRef();
    this.sendNotiicationRef = React.createRef();
  }

  componentDidMount() {
    // const status = ['requested', 'accepted', 'active'];
    const status = [];
    if (this.formRef.current !== null) {
      this.formRef.current.setFieldsValue({
        status,
      });
    }

    this.fetch();
    this.setCustomInterval();
  }

  componentWillUnmount() {
    this.clearCustomInterval();
  }

  render() {
    const {
      data, pagination, loading, docId, patientId,
      selectedRows,
    } = this.state;

    return (
      <div>
        <style>
          {`
            .red-row,
            .red-row:hover {
              background-color: #fff4f4 !important;
            }
          `}

        </style>
        <Modal
          btnRef={this.sendNotiicationRef}
          header={(
            <>
              <div>
                Send Notification to: selected doctors
              </div>
            </>
          )}
          size="modal-sm"
        >
          <SendNotification fcmToken={selectedRows.map((chat) => chat.doctor_fcm_token)} />
        </Modal>
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
              <Col md={5} sm={24} xs={24}>
                <Form.Item
                  name="date"
                  initialValue={[moment().add(-1, 'day').endOf('day'), moment(moment(), dateFormat)]}
                >
                  <DatePicker.RangePicker
                    format={dateFormat}
                    style={{ width: '100%' }}
                    allowClear={false}
                  />
                </Form.Item>
              </Col>

              <Col md={5} sm={12} xs={24}>
                <Form.Item name="city_id">
                  <RemoteSelect
                    endpoint="/admin/city/list"
                    placeholder="Serch by Cities"
                    optiontext={(op) => (op.name_en)}
                  />
                </Form.Item>
              </Col>
              <Col md={5} sm={12} xs={24}>
                <Form.Item name="doctor_id">
                  <RemoteSelect
                    endpoint="/admin/doctor/list"
                    placeholder="Serch by Doctors"
                    optiontext={(op) => (op.name_en)}
                  />
                </Form.Item>
              </Col>
              <Col md={5} sm={12} xs={24}>
                <Form.Item name="speciality_id">
                  <RemoteSelect
                    endpoint="/admin/speciality/list"
                    placeholder="Serch by Speciality"
                    optiontext={(op) => (op.name_en)}
                  />
                </Form.Item>
              </Col>
              <Col md={4} sm={12} xs={24}>
                <Form.Item name="spoken_language">
                  <Select
                    optionLabelProp="label"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Spoken Language"
                  >
                    {spokenLanguagesEn
                      .map((l) => (<Option key={l} value={l}>{l}</Option>))}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={3} sm={12}>
                <Form.Item name="from_minute">
                  <Select allowClear>
                    <Select.Option value={0}>Newst</Select.Option>
                    <Select.Option value={60}>1 Hour</Select.Option>
                    <Select.Option value={2 * 60}>2 Hour</Select.Option>
                    <Select.Option value={3 * 60}>3 Hour</Select.Option>
                    <Select.Option value={4 * 60}>4 Hour</Select.Option>
                    <Select.Option value={5 * 60}>5 Hour</Select.Option>
                    <Select.Option value={6 * 60}>6 Hour</Select.Option>
                    <Select.Option value={7 * 60}>7 Hour</Select.Option>
                    <Select.Option value={8 * 60}>8 Hour</Select.Option>
                    <Select.Option value={9 * 60}>9 Hour</Select.Option>
                    <Select.Option value={10 * 60}>10 Hour</Select.Option>
                    <Select.Option value={11 * 60}>11 Hour</Select.Option>
                    <Select.Option value={12 * 60}>12 Hour</Select.Option>
                    <Select.Option value={13 * 60}>13 Hour</Select.Option>
                    <Select.Option value={14 * 60}>14 Hour</Select.Option>
                    <Select.Option value={15 * 60}>15 Hour</Select.Option>
                    <Select.Option value={16 * 60}>16 Hour</Select.Option>
                    <Select.Option value={17 * 60}>17 Hour</Select.Option>
                    <Select.Option value={18 * 60}>18 Hour</Select.Option>
                    <Select.Option value={24 * 60}>Past Day</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col md={3} sm={12}>
                <Form.Item name="to_minute">
                  <Select allowClear>
                    <Select.Option value={0}>Newst</Select.Option>
                    <Select.Option value={60}>1 Hour</Select.Option>
                    <Select.Option value={2 * 60}>2 Hour</Select.Option>
                    <Select.Option value={3 * 60}>3 Hour</Select.Option>
                    <Select.Option value={4 * 60}>4 Hour</Select.Option>
                    <Select.Option value={5 * 60}>5 Hour</Select.Option>
                    <Select.Option value={6 * 60}>6 Hour</Select.Option>
                    <Select.Option value={7 * 60}>7 Hour</Select.Option>
                    <Select.Option value={8 * 60}>8 Hour</Select.Option>
                    <Select.Option value={9 * 60}>9 Hour</Select.Option>
                    <Select.Option value={10 * 60}>10 Hour</Select.Option>
                    <Select.Option value={11 * 60}>11 Hour</Select.Option>
                    <Select.Option value={12 * 60}>12 Hour</Select.Option>
                    <Select.Option value={13 * 60}>13 Hour</Select.Option>
                    <Select.Option value={14 * 60}>14 Hour</Select.Option>
                    <Select.Option value={15 * 60}>15 Hour</Select.Option>
                    <Select.Option value={16 * 60}>16 Hour</Select.Option>
                    <Select.Option value={17 * 60}>17 Hour</Select.Option>
                    <Select.Option value={18 * 60}>18 Hour</Select.Option>
                    <Select.Option value={24 * 60}>Past Day</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col md={selectedRows.length > 0 ? 16 : 17} sm={24}>
                <Form.Item name="status">
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="select status"
                    optionLabelProp="label"
                  >

                    <Option value="requested"><span style={{ color: '#1890ff' }}>Requested</span></Option>
                    <Option value="accepted"><span style={{ color: '#52c41a' }}>Accepted</span></Option>
                    <Option value="rejected"><span style={{ color: '#f5222d' }}>Rejected</span></Option>
                    <Option value="closed"><span style={{ color: '#36cfc9' }}>Closed</span></Option>
                    <Option value="hidden"><span style={{ color: '#ffa39e' }}>Hidden</span></Option>
                    <Option value="misbehaviour"><span style={{ color: '#ffc069' }}>Misbehaviour</span></Option>
                    <Option value="active"><span style={{ color: '#52c41a' }}>Active</span></Option>
                    <Option value="ignored"><span style={{ color: '#f5222d' }}>Ignored</span></Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col md={1} sm={24}>
                <Form.Item>
                  <Button type="primary" block icon={<FileExcelOutlined />} onClick={this.exportToExcel} />
                </Form.Item>
              </Col>
              {
                selectedRows.length > 0
                  ? (
                    <Col md={1} sm={24}>
                      <Form.Item>
                        <Button type="primary" danger block icon={<NotificationOutlined />} onClick={this.sendNotifications} />
                      </Form.Item>
                    </Col>
                  ) : null
              }
            </Row>

          </Form>
        </Col>
        <div style={{ position: 'relative' }}>
          <div className="loadingBar" style={{ display: !loading ? 'none' : undefined }} />
          <Table
            rowSelection={{
              type: 'checkbox',
              ...this.rowSelection,
            }}
            size="small"
            columns={this.columns}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={pagination}
            onChange={this.handleTableChange}
            rowClassName={(record) => (record.status === 'requested'
            && moment(record.created_at, 'YYYY-MM-DD hh').diff(Date.now(), 'hours') <= -5 ? 'red-row' : '')}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    );
  }
}

export default List;
