import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, AutoComplete, notification,
  Avatar,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Map, TileLayer, Marker,
} from 'react-leaflet';

import Loading from '../../basic/Loading';
import getAgentInstance from '../../../helpers/superagent';
import BinaryUploader from '../../basic/BinaryUploader';

const superagent = getAgentInstance();

const { Option } = Select;

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      latitude: 36.1912,
      longitude: 44.0091,
      data: [],
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/provider/${id}`)
        .end((err, res) => {
          this.setState({ loading: false });
          if (!err) {
            const { body } = res;
            console.log(body);
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name_en: body.name_en,
                name_ar: body.name_ar,
                name_ku: body.name_ku,
                name_tr: body.name_tr,
                address_title: body.address_title,
                phone_no: body.phone_no,
                active: body.active,
              });
              this.setState({
                data: body,
                latitude: body.latitude,
                longitude: body.longitude,
                imageSrc: body.image_id,
                coverSrc: body.cover_id,
              }, () => {
                const map = this.mapRef.current.leafletElement;
                setTimeout(() => map.invalidateSize(true), 100);
              });
            }
            this.setState({ loading: false });
          }
        });
    };

    this.onFinish = (values) => {
      this.setState({ saving: true });
      const {
        latitude, longitude, image, cover,
        imageSrc, coverSrc,
      } = this.state;
      const data = {
        ...values,
        original_image: imageSrc,
        original_cover: coverSrc,
        name_en: values.name_en,
        name_ar: values.name_ar || '',
        name_ku: values.name_ku || '',
        name_tr: values.name_tr || '',
        address_title: values.address_title || '',
        latitude: latitude || '',
        longitude: longitude || '',
        phone_no: values.phone_no || '',
        image,
        cover,
      };
      const { resourceId } = this.props;
      superagent
        .put(`/admin/provider/${resourceId}`)
        .send(data)
        .end((err) => {
          this.setState({ saving: false });
          if (!err) {
            const { reloadGrid, modal } = this.props;
            reloadGrid();
            modal.close();
            notification.success({
              placement: 'bottomRight',
              message: 'Successfully updated...',
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

    this.mapRef = React.createRef();
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchData(resourceId);
  }

  render() {
    const {
      loading, saving, data, latitude, longitude,
    } = this.state;
    const lockedPosition = [latitude, longitude];
    return (
      <>
        <Loading visible={loading} />
        <Form
          layout="vertical"
          style={{
            width: '100%',
            display: loading ? 'none' : 'initial',
          }}
          ref={this.formRef}
          onFinish={this.onFinish}
        >
          <Row gutter={10}>

            <div
              style={{
                width: '100%',
                height: 200,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundImage: data.cover_id ? `url('${process.env.REACT_APP_API_LINK}/files/${data.cover_id}')` : "",
                borderRadius: 3,
              }}
            >
              <Col
                span={24}
                style={{
                  top: 40,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {data.image_id ? (
                  <Avatar
                    size={120}
                    src={`${process.env.REACT_APP_API_LINK}/files/${data.image_id}`}
                  />
                ) : (
                  <Avatar size={120} icon={<UserOutlined />} />
                )}
              </Col>
            </div>

            <Col md={12} xs={24}>
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
            <Col md={12} xs={24}>
              <Form.Item
                label="Arabic Name"
                name="name_ar"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Kurdish Name"
                name="name_ku"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Turkish Name"
                name="name_tr"
              >
                <AutoComplete />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Phone Number"
                name="phone_no"
              >
                <AutoComplete
                  size="middle"
                  placeholder="Enter patient's phone number"
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
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

            <Col lg={12} md={24} xs={24}>
              <div style={{ padding: '0 0 8px' }}>Update your Image</div>
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
            <Col lg={12} md={24} xs={24}>
              <div style={{ padding: '0 0 8px' }}>Update your Cover</div>
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
            <Col md={6} xs={24}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="middle"
                htmlType="submit"
                loading={saving}
                block
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

export default Edit;
