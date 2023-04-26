import React, { Component } from 'react';
import {
  Col, Row,
  Form, Button,
} from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';

import getAgentInstance from '../../helpers/superagent';
import Modal from '../basic/Modal';
import RemoteSelect from '../basic/RemoteSelect';

const superagent = getAgentInstance();

class OrderProvider extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      loading: false,
    });
    this.state = this.initialState();

    this.onFinish = (values) => {
      const { record } = this.props;
      superagent
        .patch(`/admin/order/${record.id}`)
        .send({
          provider_id: values.provider_id.value,
        })
        .end((err) => {
          if (!err) {
            //
          }
          const { onProviderUpdate } = this.props;
          onProviderUpdate();
          this.providerModalRef.current.close();
        });
    };
    this.fetchData = (id) => {
      this.setState({
        loading: true,
      });
      superagent
        .get(`/admin/order//${id}`)
        .end((err, res) => {
          if (!err) {
            if (this.formRef.current !== null) {
              this.formRef.current.setFieldsValue({
                provider_id:
                  { value: res.body.provider_id, label: res.body.provider_name_en },
              });
            }
          }
          this.setState({
            loading: false,
          });
        });
    };

    this.openProviderModal = () => {
      const { record } = this.props;
      this.fetchData(record.id);
      this.providerBtn.current.click();
    };
    this.providerModalRef = React.createRef();
    this.providerBtn = React.createRef();
    this.formRef = React.createRef();
  }

  render() {
    const { record } = this.props;
    return (
      <>
        <Button
          type="text"
          style={{ padding: 0 }}
          onClick={this.openProviderModal}
        >
          {
            record.provider_name_en !== null
              ? (record.provider_name_en.charAt(0).toUpperCase() + record.provider_name_en.slice(1))
              : '---'
          }
        </Button>
        <Modal
          btnRef={this.providerBtn}
          ref={this.providerModalRef}
        >
          <Form
            // eslint-disable-next-line react/destructuring-assignment
            loading={this.state.loading}
            ref={this.formRef}
            onFinish={this.onFinish}
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  name="provider_id"
                  style={{ marginTop: 50 }}
                >
                  <RemoteSelect
                    endpoint="/admin/provider/list?limit=10&offset=0"
                    optiontext={(op) => op.name_en}
                    placeholder="Change your provider"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Button
                  block
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                />
              </Col>

            </Row>
          </Form>
        </Modal>
      </>
    );
  }
}

export default OrderProvider;
