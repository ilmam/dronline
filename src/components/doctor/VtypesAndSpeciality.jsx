import React, { Component } from 'react';
import uniqid from 'uniqid';
import {
  Col, Button, Row, Divider,
  Empty, Spin, Tooltip,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';

import RemoteSelect from '../basic/RemoteSelect';
import getAgentInstance from '../../helpers/superagent';

const superagent = getAgentInstance();

export default class VtypesAndSpeciality extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      disableVisitsButton: true,
      disableSpecialityButton: true,
      selectedVisit: undefined,
      selectedSpeciality: undefined,
      visits: [],
      speciality: [],
      visitLoader: false,
      specialityLoader: false,
    });
    this.state = this.initialState();

    this.onVisitChange = (v) => {
      this.setState({
        selectedVisit: v,
      });
      if (v) {
        this.setState({ disableVisitsButton: false });
      } else {
        this.setState({ disableVisitsButton: true });
      }
    };

    this.addVisitType = () => {
      const { selectedVisit } = this.state;
      const { docId } = this.props;
      superagent
        .post(`/doctor/${docId}/visittype`)
        .send({ visit_types: [{ visit_type_id: selectedVisit.key }] })
        .end((err) => {
          if (!err) {
            this.fetchVisits(docId);
          }
        });
    };

    this.deleteVisits = (id) => {
      const { docId } = this.props;
      superagent
        .delete(`/doctor/${docId}/visittype/${id}`)
        .end((res) => {
          if (!res) {
            this.fetchVisits(docId);
          }
        });
    };

    this.fetchVisits = (docId) => {
      this.setState({ visitLoader: true });
      superagent
        .get(`/doctor/${docId}/visittype/list`)
        .query({
          offset: 0,
          limit: 100,
        })
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            this.setState({ visits: body });
          }
          this.setState({ visitLoader: false });
        });
    };

    this.onSpecialityChange = (v) => {
      this.setState({
        selectedSpeciality: v,
      });
      if (v) {
        this.setState({ disableSpecialityButton: false });
      } else {
        this.setState({ disableSpecialityButton: true });
      }
    };

    this.addSpecialitys = () => {
      const { selectedSpeciality } = this.state;
      const { docId } = this.props;
      superagent
        .post(`/doctor/${docId}/speciality`)
        .send({ specialities: [{ speciality_id: selectedSpeciality.key }] })
        .end((err) => {
          if (!err) {
            this.fetchSpecialitys(docId);
          }
        });
    };

    this.deleteSpeciality = (id) => {
      const { docId } = this.props;
      superagent
        .delete(`/doctor/${docId}/speciality/${id}`)
        .end((res) => {
          if (!res) {
            this.fetchSpecialitys(docId);
          }
        });
    };

    this.fetchSpecialitys = (docId) => {
      this.setState({ specialityLoader: true });
      superagent
        .get(`/doctor/${docId}/speciality/list`)
        .query({
          offset: 0,
          limit: 100,
        })
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            this.setState({ speciality: body });
          }
          this.setState({ specialityLoader: false });
        });
    };
  }

  componentDidMount() {
    const { docId } = this.props;
    this.fetchVisits(docId);
    this.fetchSpecialitys(docId);
  }

  render() {
    const {
      visits, speciality, disableVisitsButton,
      disableSpecialityButton, visitLoader, specialityLoader,
    } = this.state;

    return (
      <Row gutter={10}>
        <Col span={12}>
          <Divider
            orientation="left"
            plain
          >
            List of specialities
          </Divider>
          <Row>
            <Col span={20}>
              <RemoteSelect
                endpoint="/admin/speciality/list"
                onChange={this.onSpecialityChange}
                optiontext={(op) => (
                  <>
                    <Row>
                      <Col span={16}>
                        <div>{op.name_en}</div>
                      </Col>
                      <Col span={8} style={{ textAlign: 'end' }}>
                        <Tooltip
                          color="#34d698"
                          placement="top"
                          title={(
                            <>
                              <div>
                                Active:
                                {' '}
                                {op.active ? 'True' : 'False'}
                              </div>
                            </>
                        )}
                        >
                          { op.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                        </Tooltip>
                      </Col>
                    </Row>
                  </>
                )}
              />
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                type="primary"
                style={{ width: '90%' }}
                icon={<PlusOutlined />}
                onClick={this.addSpecialitys}
                disabled={disableSpecialityButton}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 15, position: 'relative' }}>
            { speciality ? speciality.map((mySpecialityArray) => (
              <Row
                style={{
                  padding: '0px 0px 5px 12px',
                  marginTop: 5,
                  borderBottom: '1px solid #eee',
                  alignItems: 'center',
                }}
                key={uniqid()}
              >
                <Col span={20}>
                  <Row>
                    <Col span={18}>
                      <div>{mySpecialityArray.name_en}</div>
                    </Col>
                    <Col span={5} style={{ textAlign: 'end' }}>
                      <Tooltip
                        color="#34d698"
                        placement="top"
                        title={(
                          <>
                            <div>
                              Active:
                              {' '}
                              {mySpecialityArray.active ? 'True' : 'False'}
                            </div>
                          </>
                        )}
                      >
                        { mySpecialityArray.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                      </Tooltip>
                    </Col>
                  </Row>
                </Col>
                <Col span={3} offset={1}>
                  <Button
                    block
                    type="dashed"
                    shape="round"
                    size="middle"
                    icon={<DeleteOutlined />}
                    onClick={() => this.deleteSpeciality(mySpecialityArray.id)}
                  />
                </Col>
              </Row>
            )) : null }

            { speciality.length === 0 && !visitLoader ? (
              <Empty description="No visit types yet!" />
            ) : null }

            { visitLoader ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              >
                <Spin />
              </div>
            ) : null }

            { specialityLoader ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              >
                <Spin />
              </div>
            ) : null }
          </div>

        </Col>

        <Col span={12}>
          <Divider
            orientation="left"
            plain
          >
            Visit Types
          </Divider>
          <Row>
            <Col span={20}>
              <RemoteSelect
                onChange={this.onVisitChange}
                endpoint="/admin/visittype/list"
                optiontext={(op) => (
                  <>
                    <Row>
                      <Col span={16}>
                        <div>{op.name_en}</div>
                      </Col>
                      <Col span={8} style={{ textAlign: 'end' }}>
                        <Tooltip
                          color="#34d698"
                          placement="top"
                          title={(
                            <>
                              <div>
                                Active:
                                {' '}
                                {op.active ? 'True' : 'False'}
                              </div>
                            </>
                        )}
                        >
                          { op.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                        </Tooltip>
                      </Col>
                    </Row>
                  </>
                )}
              />
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                type="primary"
                style={{ width: '90%' }}
                icon={<PlusOutlined />}
                onClick={this.addVisitType}
                disabled={disableVisitsButton}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 15, position: 'relative' }}>
            { visits ? visits.map((visitArray) => (
              <Row
                style={{
                  padding: '0px 0px 5px 12px',
                  marginTop: 5,
                  borderBottom: '1px solid #eee',
                  alignItems: 'center',
                }}
                key={uniqid()}
              >
                <Col span={20}>
                  <Row>
                    <Col span={18}>
                      <div>{visitArray.name_en}</div>
                    </Col>
                    <Col span={5} style={{ textAlign: 'end' }}>
                      <Tooltip
                        color="#34d698"
                        placement="top"
                        title={(
                          <>
                            <div>
                              Active:
                              {' '}
                              {visitArray.active ? 'True' : 'False'}
                            </div>
                          </>
                        )}
                      >
                        { visitArray.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                      </Tooltip>
                    </Col>
                  </Row>
                </Col>
                <Col span={3} offset={1}>
                  <Button
                    block
                    type="dashed"
                    shape="round"
                    size="middle"
                    icon={<DeleteOutlined />}
                    onClick={() => this.deleteVisits(visitArray.id)}
                  />
                </Col>
              </Row>
            )) : null }

            { visits.length === 0 && !visitLoader ? (
              <Empty description="No visit types yet!" />
            ) : null }

            { visitLoader ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              >
                <Spin />
              </div>
            ) : null }
          </div>

        </Col>

      </Row>
    );
  }
}
