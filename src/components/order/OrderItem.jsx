import React, { Component } from 'react';
import {
  Col, Row, Popover, Collapse,
  Form, Input, Avatar, Tag,
  Table,
} from 'antd';
import {
  ExclamationCircleTwoTone,
} from '@ant-design/icons';
import {
  Map, TileLayer, Marker, Popup,
  FeatureGroup,
} from 'react-leaflet';
import L from 'leaflet';
import moment from 'moment';
import uniqid from 'uniqid';
import getAgentInstance from '../../helpers/superagent';
import patient from '../../assets/images/patient.svg';
import provider from '../../assets/images/provider.svg';

const superagent = getAgentInstance();
let content = () => '';
const dateFormat = 'YYYY-MM-DD HH:mm A';
const provIcon = new L.Icon({
  iconUrl: provider,
  iconSize: 35,
});
const patientIcon = new L.Icon({
  iconUrl: patient,
  iconSize: 35,
});
class OrderItem extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      saving: false,
      loading: false,
      isLoaded: false,
      data: [],
      items: [],
      markers: [[1, 2], [3, 4]],
    });
    this.state = this.initialState();
    this.changeFormat = (status) => {
      switch (status) {
        case 'pending':
          return 'Pending';
        case 'received':
          return 'Received';
        case 'ontheway':
          return 'One The Way';
        case 'completed':
          return 'Completed';
        case 'canceled':
          return 'Canceled';
        default:
          return '---';
      }
    };
    this.columns = [
      {
        title: '#',
        key: 'order_id',
        render: (v, r, i) => (i + 1),
      },
      {
        title: 'Item (Price * Quantity)',
        render: (item) => (
          <>
            {`${item.item_name_en}  (${item.qty} x ${item.price}) = ${item.total}`}
          </>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (value) => (value.charAt(0).toUpperCase() + value.slice(1)),
      },
    ];
    this.fetchData = (id) => {
      this.setState({
        loading: true,
      });
      superagent
        .get(`/admin/order//${id}`)
        .end((err, res) => {
          if (!err) {
            if (this.formRef.current !== null && this.mapRef.current !== null) {
              const formattedStatus = this.changeFormat(res.body.status);
              this.formRef.current.setFieldsValue({
                patient: `${res.body.patient_name} (${`${res.body.patient_phone_no}`.slice(3, 13)})`,
                city_name_en: res.body.city_name_en,
                status: formattedStatus,
                order_note: res.body.order_note,
                address_note: res.body.address_note,
                preferred_time: res.body.preferred_time,
                provider_name_en: res.body.provider_name_en,
                provider_phone_no: res.body.provider_phone_no,
                provider_address_title: res.body.provider_address_title,
              });
              this.setState({
                items: res.body.items,
                data: res.body,
                markers: [
                  [res.body.latitude || 0, res.body.longitude || 0],
                  [res.body.provider_latitude || 0, res.body.provider_longitude || 0],
                ],
              }, () => this.reinvMapSize());
              content = (
                <Row
                  gutter={10}
                  style={{ width: 350 }}
                >
                  <Col
                    style={{ width: 350 }}
                    span={24}

                  >
                    <Tag>
                      {`Created at: ${res.body.created_at === null
                        ? 'Not Yet'
                        : moment(res.body.created_at).format(dateFormat)}`}
                    </Tag>
                  </Col>
                  <Col span={24}>
                    <Tag>
                      {`Received at: ${res.body.received_at === null
                        ? 'Not Yet'
                        : moment(res.body.received_at).format(dateFormat)}`}
                    </Tag>
                  </Col>
                  <Col span={24}>
                    <Tag>
                      {`On the way at: ${res.body.ontheway_at === null
                        ? 'Not Yet'
                        : moment(res.body.ontheway_at).format(dateFormat)}`}
                    </Tag>
                  </Col>
                  <Col span={24}>
                    <Tag>
                      {`Completed at: ${res.body.completed_at === null
                        ? 'Not Yet'
                        : moment(res.body.completed_at).format(dateFormat)}`}
                    </Tag>
                  </Col>
                  <Col span={24}>
                    <Tag>
                      {`Cancelled at: ${res.body.canceled_at === null
                        ? 'Not Yet'
                        : moment(res.body.canceled_at).format(dateFormat)}`}
                    </Tag>
                  </Col>
                </Row>
              );
            }
          }
          this.setState({
            loading: false,
          });
        });
    };
    this.reinvMapSize = () => {
      const { isLoaded, markers } = this.state;
      if (this.mapRef.current) {
        const map = this.mapRef.current.leafletElement;
        const bounds = L.latLngBounds([...markers]);
        map.fitBounds(bounds);
        if (!isLoaded) {
          setTimeout(() => map.invalidateSize(true), 100);
          this.setState({
            isLoaded: true,
          });
        }
      }
    };
    this.groupRef = React.createRef();
    this.mapRef = React.createRef();
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props;
    this.fetchData(id);
  }

  render() {
    const {
      loading, markers, items, data,
    } = this.state;
    return (
      <Form
        loading={loading}
        ref={this.formRef}
        layout="vertical"
        style={{ marginTop: 35 }}
      >
        <Row gutter={10}>
          <Col xl={10} lg={10} md={24} sm={24}>
            <Row>
              <Col span={3}>
                <Form.Item label="Patient">
                  {data.patient_image_id
                    ? <Avatar src={`${process.env.REACT_APP_API_LINK}/files/${data.patient_image_id}`} />
                    : <Avatar icon={<UserOutlined />} /> }
                </Form.Item>
              </Col>
              <Col span={21}>
                <Form.Item label=" " name="patient">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xl={10} lg={10} md={24} sm={24}>
            <Form.Item label="City" name="city_name_en">
              <Input />
            </Form.Item>
          </Col>
          <Col xl={4} lg={4} md={24} sm={24}>
            <Row>
              <Col span={22}>
                <Form.Item label="Status" name="status">
                  <Input style={{ padding: 0 }} bordered={false} />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label=" ">
                  <Popover
                    title="Order Status"
                    content={content}
                  >
                    <ExclamationCircleTwoTone
                      style={{ transform: 'scale(1.25)' }}
                    />
                  </Popover>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row
              gutter={10}
              style={{ marginBottom: 10 }}
            >
              <Col span={12}>
                <Table
                  pagination={false}
                  columns={this.columns}
                  rowKey={() => uniqid()}
                  dataSource={items}
                  loading={loading}
                />
              </Col>
              <Col span={12}>
                <Map
                  ref={this.mapRef}
                  style={{ height: '300px', width: '100%' }}
                  zoom={13}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FeatureGroup ref={this.groupRef}>
                    {markers.map((position, i) => (
                      <>
                        <Marker
                          key={uniqid()}
                          position={position}
                          icon={i === 1 ? provIcon : patientIcon}
                        >
                          <Popup>
                            <Avatar
                              src={
                              i === 1
                                ? `${process.env.REACT_APP_API_LINK}/files/${data.provider_image_id}`
                                : `${process.env.REACT_APP_API_LINK}/files/${data.patient_image_id}`
                              }
                              style={{ margin: 10 }}
                            />
                            <Tag>
                              {i === 1 ? data.provider_name_en : data.patient_name}
                            </Tag>
                          </Popup>
                        </Marker>
                      </>
                    ))}
                  </FeatureGroup>
                </Map>
              </Col>
            </Row>
          </Col>
          <Col xl={8} lg={8} md={24} sm={24}>
            <Row>
              <Col span={4}>
                <Form.Item label="Provider">
                  {data.patient_image_id
                    ? <Avatar src={`${process.env.REACT_APP_API_LINK}/files/${data.patient_image_id}`} />
                    : <Avatar icon={<UserOutlined />} /> }
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item label=" " name="provider_name_en">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

          </Col>
          <Col xl={8} lg={8} md={24} sm={24}>
            <Form.Item label="Provider Number" name="provider_phone_no">
              <Input />
            </Form.Item>
          </Col>
          <Col xl={8} lg={8} md={24} sm={24}>
            <Form.Item label="Provider address" name="provider_address_title">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Collapse
              expandIconPosition="right"
              defaultActiveKey="1"
            >
              <Collapse.Panel
                key="1"
                header="Notes & Results"
                forceRender
                style={{ margin: '10px 0' }}
              >
                <Row gutter={10}>
                  <Col xl={8} lg={8} md={24} sm={24}>
                    <Form.Item label="Order Notes" name="order_note">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                  <Col xl={8} lg={8} md={24} sm={24}>
                    <Form.Item label="Address Notes" name="address_note">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                  <Col xl={8} lg={8} md={24} sm={24}>
                    <Form.Item label="Preferred Time" name="preferred_time">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                  {data.status === 'completed'
                    ? (
                      <>
                        Result:
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${process.env.REACT_APP_API_LINK}/files/${data.result}`}
                        >
                          {data.result}
                        </a>
                      </>
                    ) : null}
                </Row>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default OrderItem;
