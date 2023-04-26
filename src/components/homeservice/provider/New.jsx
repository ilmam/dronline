import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, AutoComplete, notification,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import {
  Map, TileLayer, Marker,
} from 'react-leaflet';

import getAgentInstance from '../../../helpers/superagent';
import BinaryUploader from '../../basic/BinaryUploader';

const superagent = getAgentInstance();

const { Option } = Select;

class New extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      latitude: 36.1912,
      longitude: 44.0091,
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      this.setState({ loading: true });
      const {
        latitude, longitude, image, cover,
      } = this.state;
      const phoneNum = `${values.phone_no ? values.country_code : ''}${values.phone_no || ''}`;
      const data = {
        ...values,
        name_en: values.name_en,
        name_ar: values.name_ar || '',
        name_ku: values.name_ku || '',
        name_tr: values.name_tr || '',
        address_title: values.address_title || '',
        latitude,
        longitude,
        phone_no: phoneNum,
        image,
        cover,
      };

      superagent
        .post('/admin/provider')
        .send(data)
        .end((err) => {
          this.setState({ loading: false });
          if (!err) {
            const { reloadGrid } = this.props;
            this.formRef.current.resetFields();
            reloadGrid();
            notification.success({
              placement: 'bottomRight',
              message: 'Successfully added to provider\'s',
              duration: 3,
            });
          }
        });
    };

    this.onImageChange = (v) => {
      if (v.length === 1) {
        this.setState({ image: v[0].base64 });
      } else this.setState({ image: undefined });
    };

    this.onCoverChange = (v) => {
      if (v.length === 1) {
        this.setState({ cover: v[0].base64 });
      } else this.setState({ cover: undefined });
    };

    this.handleMap = (event) => {
      const { lat, lng } = event.latlng;
      this.setState({
        latitude: lat,
        longitude: lng,
      });
    };

    this.formRef = React.createRef();
    this.mapRef = React.createRef();
  }

  componentDidMount() {
  }

  render() {
    const { loading, latitude, longitude } = this.state;
    const lockedPosition = [latitude, longitude];
    return (
      <>
        <Form
          layout="vertical"
          style={{ width: '100%' }}
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>

            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="English Name"
                name="name_en"
                rules={[
                  {
                    required: true,
                    message: 'English name is required!',
                  },
                ]}
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="Arabic Name"
                name="name_ar"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="Kurdish Name"
                name="name_ku"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="Turkish Name"
                name="name_tr"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="Phone Number"
                name="phone_no"
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
                />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item
                label="Active"
                name="active"
                rules={[
                  {
                    required: true,
                    message: 'Active is required!',
                  },
                ]}
              >
                <Select
                  placeholder="Select Status"
                  allowClear
                >
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address_title" label="Address Title">
                <Input.TextArea row={4} />
              </Form.Item>
            </Col>

            <Col span={24} style={{ marginBottom: 20 }}>
              <Map
                ref={this.mapRef}
                style={{ height: '300px' }}
                center={lockedPosition}
                zoom={13}
                onClick={this.handleMap}
              >
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={lockedPosition}
                />
              </Map>
            </Col>

            <Col span={12}>
              <div style={{ padding: '0 0 8px' }}>Image</div>
              <Form.Item
                name="image"
              >
                <BinaryUploader
                  onChange={(v) => this.onImageChange(v)}
                  maxFileCount={1}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ padding: '0 0 8px' }}>Cover</div>
              <Form.Item
                name="cover"
              >
                <BinaryUploader
                  onChange={(v) => this.onCoverChange(v)}
                  maxFileCount={1}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
              </Form.Item>
            </Col>

          </Row>

          <Row justify="end">
            <Col md={6} sm={24} xs={24}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                htmlType="submit"
                loading={loading}
                block
              />
            </Col>
          </Row>

        </Form>
      </>
    );
  }
}

export default New;
