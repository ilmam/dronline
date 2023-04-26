import React, { Component } from 'react';

import {
  Button, Row, Col, Form, Input,
  Select, notification, Image,
} from 'antd';
import {
  SendOutlined,
} from '@ant-design/icons';

import Loading from '../basic/Loading';
import BinaryUploader from '../basic/BinaryUploader';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

const { Option } = Select;

class Edit extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: true,
      saving: false,
    });
    this.state = this.initialState();

    this.fetchData = (id) => {
      superagent.get(`/admin/category/${id}`)
        .end((err, res) => {
          this.setState({ loading: false });
          if (!err) {
            const { body } = res;
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                name_en: body.name_en,
                name_ar: body.name_ar,
                name_ku: body.name_ku,
                name_tr: body.name_tr,
                image: body.image_id,
                active: body.active,
              });
              this.setState({ imageSrc: body.image_id });
            }
            this.setState({ loading: false });
          }
        });
    };

    this.onFinish = (values) => {
      this.setState({ saving: true });
      const { resourceId } = this.props;
      const { image, imageSrc } = this.state;
      const data = {
        ...values,
        original_image: imageSrc,
        image,
      };
      superagent
        .put(`/admin/category/${resourceId}`)
        .send(data)
        .end((err) => {
          if (!err) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              description: 'Updated successfully...',
              duration: 3,
            });
            this.setState({ saving: false });

            try {
              const { reloadGrid, modal } = this.props;
              reloadGrid();
              modal.close();
            } catch (error) {
              // dummy
            }
          } else {
            this.setState({ saving: false });
          }
        });
    };

    this.onImageChange = (v) => {
      if (v.length === 1) {
        this.setState({ image: v[0].base64 });
      } else this.setState({ image: undefined });
    };

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { resourceId } = this.props;
    this.fetchData(resourceId);
  }

  render() {
    const { loading, saving, imageSrc } = this.state;
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
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="name_ar"
                label="Arabic Name"
                rules={[
                  {
                    required: true,
                    message: 'Arabic name is required!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Turkish Name"
                name="name_tr"
                rules={[
                  {
                    required: true,
                    message: 'Turkish name is required!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                label="Kurdish Name"
                name="name_ku"
                rules={[
                  {
                    required: true,
                    message: 'Kurdish name is required!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Active"
                name="active"
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
            { imageSrc !== '' ? (
              <Col md={12} xs={24}>
                <Form.Item
                  label="Current Image"
                >
                  <Image
                    height={201}
                    src={`${process.env.REACT_APP_API_LINK}/files/${imageSrc}`}
                  />
                </Form.Item>
              </Col>
            ) : null }
            <Col md={12} xs={24}>
              <div className="ant-form-item-label">Update Image</div>
              <Form.Item
                name="image"
              >
                <BinaryUploader
                  onChange={(v) => this.onImageChange(v)}
                  maxFileCount={1}
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
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
