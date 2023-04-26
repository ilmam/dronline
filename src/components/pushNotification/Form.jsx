import React, { Component } from 'react';

import {
    Button, Row, Col, Form, Input, InputNumber, Checkbox, notification,
} from 'antd';

const { TextArea } = Input;

import {
    SaveOutlined, DeleteOutlined
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import Loading from '../basic/Loading';
import getAgentInstance from '../../helpers/superagent';
import RemoteSelect from '../basic/RemoteSelect';

const superagent = getAgentInstance();

class CommunicationForm extends Component {
    constructor() {
        super();

        this.initialState = () => ({
            loading: false,
            saving: false,
            disabled: false,
            editMode: false,
            sendAll: false,
        });

        this.state = this.initialState();

        this.onFinish = (values) => {
            this.setState({ saving: true });

            var id = -1;

            var { item } = this.props;

            if (item)
                id = item.id;

            const data = {
                ...values,
                id: id,
                remove: this.state.remove === true,
            };

            if (this.state.sendAll) {
                data['offset'] = 0;
                data['limit'] = -1;
            }
            else {

            }

            superagent
                .post(`/admin/communication`)
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
                        notification.error({
                            placement: 'bottomRight',
                            message: 'Error',
                            description: err.response.body.msg,
                            duration: 3,
                        });
                        this.setState({ saving: false });
                    }
                });
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

        this.formRef = React.createRef();
    }

    componentDidMount() {
        const { item } = this.props;

        if (item) {
            this.formRef.current.setFieldsValue({
                ...item,
                send: item.sent_at !== null,
                sendAll: item.limit === -1,
                hac_item: {
                    value: item.hac_item_id,
                    label: item.hac_item_name,
                },
            });

            if (item.sent_at !== null)
                this.setState({ disabled: true });

            this.setState({ editMode: true });

            if (item.limit === -1)
                this.setState({
                    sendAll: item.limit === -1
                });
        }

        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const {
            loading, saving, disabled, editMode, sendAll
        } = this.state;
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
                        <Col md={24} xs={24}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Name</div>
                                    </div>
                                )}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Name is required!',
                                    },
                                ]}
                            >
                                <Input disabled={disabled} type="text" />
                            </Form.Item>
                        </Col>

                        <Col md={6} xs={12}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Title (English)</div>
                                    </div>
                                )}
                                name="title_en"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Title (English) is Required',
                                    },
                                ]}
                            >
                                <Input disabled={disabled} type="text" />
                            </Form.Item>
                        </Col>

                        <Col md={6} xs={12}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Title (Kurdish)</div>
                                    </div>
                                )}
                                name="title_ku"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Title (Kurdish) is Required',
                                    },
                                ]}
                            >
                                <Input disabled={disabled} type="text" />
                            </Form.Item>
                        </Col>

                        <Col md={6} xs={12}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Title (Arabic)</div>
                                    </div>
                                )}
                                name="title_ar"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Title (Arabic) is Required',
                                    },
                                ]}
                            >
                                <Input disabled={disabled} type="text" />
                            </Form.Item>
                        </Col>

                        <Col md={6} xs={12}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Title (Turkish)</div>
                                    </div>
                                )}
                                name="title_tr"
                                rules={[
                                    {
                                        required: false
                                    },
                                ]}
                            >
                                <Input disabled={disabled} type="text" />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Content (English)</div>
                                    </div>
                                )}
                                name="content_en"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Content (English) is Required',
                                    },
                                ]}
                            >
                                <TextArea disabled={disabled} rows={4} />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Content (Kurdish)</div>
                                    </div>
                                )}
                                name="content_ku"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Content (Kurdish) is Required',
                                    },
                                ]}
                            >
                                <TextArea disabled={disabled} rows={4} />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Content (Arabic)</div>
                                    </div>
                                )}
                                name="content_ar"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Content (Arabic) is Required',
                                    },
                                ]}
                            >
                                <TextArea disabled={disabled} rows={4} />
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>
                            <Form.Item
                                label={(
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 5 }}>Content (Turkish)</div>
                                    </div>
                                )}
                                name="content_tr"
                                rules={[
                                ]}
                            >
                                <TextArea disabled={disabled} rows={4} />
                            </Form.Item>
                        </Col>




                        <Col md={8} xs={24}>
                            <Form.Item
                                label="HAC Item"
                                name="hac_item"
                                rules={[
                                ]}
                            >
                                <RemoteSelect
                                    endpoint="https://dronline.shift.software/api/cms/list?publicList=true"
                                    noAuth={true}
                                    optiontext={(op) => op.name_en}
                                />
                            </Form.Item>
                        </Col>






                        <Col md={24} xs={24}>
                            <Form.Item valuePropName="checked" name="sendAll">
                                <Checkbox style={{ width: '100%' }} onChange={(e) => {
                                    if (e.target.checked) {
                                        this.setState({ sendAll: true });
                                    }
                                    else {
                                        this.setState({ sendAll: false });
                                    }
                                }} disabled={disabled}>
                                    <strong>Send To All</strong> (Send to All patients in the Database).
                                </Checkbox>
                            </Form.Item>
                        </Col>

                        {
                            sendAll ? null :
                                <Col md={12} xs={24}>
                                    <Form.Item
                                        label={(
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ marginRight: 5 }}>Skip</div>
                                            </div>
                                        )}
                                        name="offset"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Skip is required!',
                                            },
                                        ]}
                                    >
                                        <InputNumber disabled={disabled} min="0" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                        }

                        {
                            sendAll ? null :
                                <Col md={12} xs={24}>
                                    <Form.Item
                                        label={(
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ marginRight: 5 }}>Message Count</div>
                                            </div>
                                        )}
                                        name="limit"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Message Count is required!',
                                            },
                                        ]}
                                    >
                                        <InputNumber disabled={disabled} min="1" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                        }

                    </Row>

                    <Row>
                        <Col md={24} xs={24}>
                            <Form.Item valuePropName="checked" name="send">
                                <Checkbox style={{ width: '100%' }} disabled={disabled}>
                                    <strong>Confirm Delivery</strong> (This will Send all the Messages. Leave this un-checked to save as draft).
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    {disabled ? null :
                        <Row justify="end">

                            {!editMode ? null :
                                <Col md={6} xs={24} style={{ margin: '0 10px' }}>
                                    <Button
                                        type="danger"
                                        icon={<DeleteOutlined />}
                                        size="middle"
                                        htmlType="submit"
                                        loading={saving}
                                        block
                                        onClick={() => { this.setState({ remove: true }); }}
                                    >Delete</Button>
                                </Col>
                            }

                            <Col md={6} xs={24}>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    size="middle"
                                    htmlType="submit"
                                    loading={saving}
                                    block
                                >Save</Button>
                            </Col>
                        </Row>
                    }
                </Form>
            </>
        );
    }
}

export default CommunicationForm;
