/* eslint-disable camelcase */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import {
    Row, Col, Form, Switch, Input,
    Button, Select, DatePicker, Divider,
    Collapse, InputNumber, notification, Popover, Image,
    TimePicker,
} from 'antd';
import moment from 'moment';
import {
    EditOutlined, FormOutlined, DeleteOutlined, PlusCircleOutlined, MinusCircleOutlined
} from '@ant-design/icons';
import {
    Map, TileLayer, Marker,
} from 'react-leaflet';

import debounce from 'lodash/debounce';

import Loading from '../basic/Loading';
import Base64Upload from '../basic/Base64Uploader';
import BinaryUploader from '../basic/BinaryUploader';
import RemoteSelect from '../basic/RemoteSelect';
import getAgentInstance from '../../helpers/superagent';
import VtypesAndSpeciality from './VtypesAndSpeciality';
import ImageNotAvailable from '../../assets/images/no_avatar.jpg';
import CoverNotAvailable from '../../assets/images/CoverNotAvailable.jpg';

const superagent = getAgentInstance();

const { Option } = Select;
const { Panel } = Collapse;
const dateFormat = 'YYYY-MM-DD';
const spokenLanguagesEn = ['English', 'Kurdish - Sorani', 'Kurdish - Badini', 'Arabic', 'Turkish', 'Persian', 'Germany', 'French', 'Spanish'];
const spokenLanguagesKu = {
    English: 'ئینگلیزی',
    'Kurdish - Sorani': 'کوردی سۆرانی',
    'Kurdish - Badini': 'کوردی بادینی',
    Arabic: 'عەرەبی',
    Turkish: 'تورکی',
    Persian: 'فارسی',
    Germany: 'ئەڵمانی',
    French: 'فەڕەنسی',
    Spanish: 'ئیسپانی',
};
const spokenLanguagesAr = {
    English: 'الإنجليزية',
    // Kurdish: 'كردي',
    'Kurdish - Sorani': 'كردي سوراني',
    'Kurdish - Badini': 'كردي باديني',
    Arabic: 'عربى',
    Turkish: 'التركية',
    Persian: 'فارسية',
    Germany: 'ألمانية',
    French: 'فرنسي',
    Spanish: 'الأسبانية',
};
const spokenLanguagesTr = {
    English: 'ingilizce',
    'Kurdish - Sorani': 'Kürt Sorani',
    'Kurdish - Badini': 'Kürt Badini',
    Arabic: 'Arapça',
    Turkish: 'Türk',
    Persian: 'Farsça',
    Germany: 'Almanya',
    French: 'Fransızca',
    Spanish: 'İspanyol',
};

@observer
@inject('userStore')
class Edit extends Component {
    constructor() {
        super();
        this.initialState = () => ({
            data: [],
            latitude: 36.1912,
            longitude: 44.0091,
            loading: true,
            saving: false,
            isMapCollapsed: false,
            image: null,
            origianl_image: null,
            cover: null,
            original_cover: null,
        });
        this.state = this.initialState();

        this.handleMapClick = (event) => {
            const { lat, lng } = event.latlng;
            this.setState({
                latitude: lat,
                longitude: lng,
            });
        };
        this.handleAvatarUpload = (value) => {
            this.setState({
                image: value,
            });
        };
        this.handleCoverUpload = (value) => {
            this.setState({
                cover: value,
            });
        };
        this.clearSelectedAvatar = () => {
            this.handleAvatarUpload(undefined);
        };
        this.clearSelectedCover = () => {
            this.handleCoverUpload(undefined);
        };
        this.fetchData = (id) => {
            const { latitude, longitude } = this.state;
            superagent
                .get(`/admin/doctor/${id}`)
                .end((err, res) => {
                    if (!err) {
                        const { body } = res;
                        if (this.formRef.current !== null) {
                            this.formRef.current.setFieldsValue({
                                shift_start_from: body.shift_start_from ? moment(`2021-01-01 ${body.shift_start_from}`) : moment(),
                                shift_end_at: body.shift_end_at ? moment(`2021-01-01 ${body.shift_end_at}`) : moment(),
                                max_chat_limit: body.max_chat_limit,
                                phone_no: body.phone_no,
                                name_en: body.name_en,
                                name_ku: body.name_ku,
                                name_ar: body.name_ar,
                                name_tr: body.name_tr,

                                clinic_name_en: body.clinic_name_en,
                                clinic_name_ku: body.clinic_name_ku,
                                clinic_name_ar: body.clinic_name_ar,
                                clinic_name_tr: body.clinic_name_tr,

                                address_title_en: body.address_title_en,
                                address_title_ku: body.address_title_ku,
                                address_title_ar: body.address_title_ar,
                                address_title_tr: body.address_title_tr,

                                bio_en: body.bio_en,
                                bio_ku: body.bio_ku,
                                bio_ar: body.bio_ar,
                                bio_tr: body.bio_tr,

                                certificate_en: body.certificate_en,
                                certificate_ku: body.certificate_ku,
                                certificate_ar: body.certificate_ar,
                                certificate_tr: body.certificate_tr,

                                gender: body.gender,
                                birthdate: body.birthdate ? moment(body.birthdate) : moment('1950-01-01'),
                                email: body.email,
                                schedule_ahead: body.schedule_ahead,
                                city_id: body.city_id === 0
                                    ? undefined : { label: body.city_name_en, value: body.city_id },
                                country_id: body.country_id === 0
                                    ? undefined : { label: body.country_name_en, value: body.country_id },
                                clinic_phone_no: body.clinic_phone_no,
                                examination_fee: body.examination_fee,
                                defualt_visit_type_id: body.defualt_visit_type_id === 0
                                    ? undefined
                                    : { label: body.visit_type_name_en, value: body.defualt_visit_type_id },
                                is_online: Boolean(body.is_online),
                                open_to_visit: Boolean(body.open_to_visit),
                                spoken_language: body.spoken_language_en ? body.spoken_language_en.split(',') : undefined,

                                telemedicine_pricing: !body.telemedicine_pricing ? [] : body.telemedicine_pricing.map((x) => {
                                    return {
                                        duration: moment(`2021-01-01 ${x.duration}`),
                                        rate: x.rate
                                    };
                                })
                            });
                        }
                        this.setState({
                            data: body,
                            loading: false,
                            original_image: body.image_id,
                            original_cover: body.cover_id,
                            latitude: body.latitude || latitude,
                            longitude: body.longitude || longitude,
                        });
                    }
                });
        };
        this.onFinish = (values) => {
            this.setState({ saving: true });
            const {
                latitude, longitude, image, original_image, cover, original_cover,
                templateHeader, templateFooter, old_original_cover, old_original_image,
            } = this.state;
            const data = {
                ...values,
                ...this.fetchSpokenLanguagesObject(values.spoken_language),
                shift_start_from: moment(values.shift_start_from).format('HH:mm').toString(),
                shift_end_at: moment(values.shift_end_at).format('HH:mm').toString(),

                longitude: longitude || 0,
                latitude: latitude || 0,
                birthdate: moment(values.birthdate).format(dateFormat).toString(),
                city_id: values.city_id.value,
                country_id: values.country_id.value,
                extra_phone_no: '',
                defualt_visit_type_id:
                    values.defualt_visit_type_id ? values.defualt_visit_type_id.value : 0,
                receipt_header: templateHeader,
                receipt_footer: templateFooter,
                telemedicine_pricing: values.telemedicine_pricing.map((x) => {
                    return { duration: moment(x.duration).format('HH:mm').toString(), rate: x.rate };
                })
            };

            if (image) data.image = image;
            if (original_image && image) {
                data.original_image = original_image;
            }
            if (!original_image) {
                data.original_image = old_original_image;
            }
            if (!image && !original_image) {
                data.image = '';
            }

            if (cover) data.cover = cover;
            if (original_cover && cover) {
                data.original_cover = original_cover;
            }
            if (!original_cover) {
                data.original_cover = old_original_cover;
            }
            if (!cover && !original_cover) {
                data.cover = '';
            }

            delete data.spoken_language;
            const { resourceId, reloadGrid, modal } = this.props;
            superagent
                .put(`/admin/doctor/${resourceId}`)
                .send(data)
                .end((err) => {
                    if (!err) {
                        notification.success({
                            message: 'Your data has been submitted successfully',
                            description: '',
                            placement: 'bottomRight',
                        });
                        try {
                            reloadGrid();
                            modal.close();
                        } catch (error) {
                            ///
                        }
                    }
                    this.setState({ saving: false });
                });
        };

        this.fetchSpokenLanguagesObject = (values) => {
            const ku = [];
            const ar = [];
            const tr = [];
            if (values) {
                values.forEach((lang) => {
                    ku.push(spokenLanguagesKu[lang]);
                    ar.push(spokenLanguagesAr[lang]);
                    tr.push(spokenLanguagesTr[lang]);
                });
                return {
                    spoken_language_en: values.join(','),
                    spoken_language_ar: ar.join(','),
                    spoken_language_ku: ku.join(','),
                    spoken_language_tr: tr.join(','),
                };
            }
            return {
                spoken_language_en: '',
                spoken_language_ar: '',
                spoken_language_ku: '',
                spoken_language_tr: '',
            };
        };

        this.onHeaderChange = (v) => {
            if (v.length === 1) {
                this.setState({ templateHeader: v[0].base64 });
            } else this.setState({ templateHeader: undefined });
        };

        this.onFooterChange = (v) => {
            if (v.length === 1) {
                this.setState({ templateFooter: v[0].base64 });
            } else this.setState({ templateFooter: undefined });
        };

        this.reinvMapSize = () => {
            const { isMapCollapsed } = this.state;
            if (!isMapCollapsed) {
                const map = this.mapRef.current.leafletElement;
                setTimeout(() => map.invalidateSize(true), 100);
                this.setState({
                    isMapCollapsed: true,
                });
            }
        };

        this.clearExistingCover = (value) => {
            this.setState({
                original_cover: undefined,
                old_original_cover: value,
            });
        };

        this.clearExistingImage = (value) => {
            this.setState({
                original_image: undefined,
                old_original_image: value,
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
        this.mapRef = React.createRef();
        this.formRef = React.createRef();
    }

    componentDidMount() {
        const { resourceId } = this.props;
        this.fetchData(resourceId);
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const {
            loading, saving, data, latitude, longitude,
            isMobile, original_image, original_cover,
            image, cover,
        } = this.state;
        const position = [latitude, longitude];
        const { resourceId } = this.props;

        const availableCover = original_cover
            ? `url('${process.env.REACT_APP_API_LINK}/files/${original_cover}')` : `url('${CoverNotAvailable}')`;
        const availableImage = original_image
            ? `url('${process.env.REACT_APP_API_LINK}/files/${original_image}')` : `url('${ImageNotAvailable}')`;

        return (
            <>
                <Loading visible={loading} />
                <Form
                    onFinish={this.onFinish}
                    layout="vertical"
                    style={{ display: loading ? 'none' : 'initial' }}
                    ref={this.formRef}
                >
                    <Row gutter={10}>
                        <Col span={24} style={{ height: 350, marginBottom: 50, position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backgroundImage: availableCover,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: 3,
                            }}
                            />
                            <Row justify="end" gutter={10} style={{ padding: 10 }}>
                                {image ? (
                                    <Popover content={<img src={image} alt="profile" style={{ width: 300 }} />}>
                                        <Col span={3}>
                                            <Button
                                                onClick={this.clearSelectedAvatar}
                                                danger
                                                type="primary"
                                                block
                                                icon={<DeleteOutlined />}
                                                loading={saving}
                                            >
                                                Picked Profile
                                            </Button>
                                        </Col>
                                    </Popover>

                                ) : null}
                                {cover ? (
                                    <Popover content={<img src={cover} alt="profile" style={{ width: 300 }} />}>
                                        <Col span={3}>
                                            <Button
                                                onClick={this.clearSelectedCover}
                                                danger
                                                type="primary"
                                                block
                                                icon={<DeleteOutlined />}
                                                loading={saving}
                                            >
                                                Picked Cover
                                            </Button>
                                        </Col>
                                    </Popover>
                                ) : null}

                                <Popover
                                    placement="left"
                                    content={(
                                        <Row style={{ marginTop: '4%', maxWidth: 300 }}>
                                            <Col span={24}>
                                                <Base64Upload
                                                    removetext="Remove"
                                                    callbackFunction={this.handleCoverUpload}
                                                />
                                            </Col>
                                            {original_cover ? (
                                                <Col span={24} style={{ marginTop: 10 }}>
                                                    <Button
                                                        block
                                                        danger
                                                        type="dashed"
                                                        onClick={() => this.clearExistingCover(original_cover)}
                                                    >
                                                        Delete Existing Cover
                                                    </Button>
                                                </Col>
                                            ) : null}
                                        </Row>
                                    )}
                                    trigger="hover"
                                >
                                    <Col span={1}>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={this.openProfileModal}
                                            type="primary"
                                            size="middle"
                                            block
                                        />
                                    </Col>
                                </Popover>
                            </Row>
                            <div style={{
                                display: 'flex',
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                            }}
                            >
                                <Form.Item
                                    valuePropName="checked"
                                    name="open_to_visit"
                                    rules={[{ required: true }]}
                                    style={{ padding: '0 10px' }}
                                >
                                    <Switch
                                        checkedChildren="Open"
                                        unCheckedChildren="Closed"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="is_online"
                                    valuePropName="checked"
                                    rules={[{ required: true }]}
                                    style={{ padding: '0 10px' }}
                                >
                                    <Switch
                                        checkedChildren="Online"
                                        unCheckedChildren="Offline"
                                    />
                                </Form.Item>
                            </div>

                            <Popover
                                placement="right"
                                content={(
                                    <Row style={{ marginTop: '4%', maxWidth: 300 }}>
                                        <Col span={24}>
                                            <Base64Upload
                                                removetext="Remove"
                                                callbackFunction={this.handleAvatarUpload}
                                            />
                                        </Col>
                                        {original_image ? (
                                            <Col span={24} style={{ marginTop: 10 }}>
                                                <Button
                                                    block
                                                    danger
                                                    type="dashed"
                                                    onClick={() => this.clearExistingImage(original_image)}
                                                >
                                                    Delete Existing Image
                                                </Button>
                                            </Col>
                                        ) : null}
                                    </Row>
                                )}
                                trigger="hover"
                            >
                                <div style={{
                                    position: 'absolute',
                                    width: 120,
                                    height: 120,
                                    bottom: -20,
                                    left: 20,
                                    backgroundImage: availableImage,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    borderRadius: 3,
                                    boxShadow: 'rgb(156 155 155) 0px 0px 5px 1px',
                                }}
                                />
                            </Popover>
                        </Col>
                        <Col span={24}>
                            <Row gutter={10}>
                                <Col span={24}>
                                    <Collapse
                                        style={{ margin: '10px 0' }}
                                        defaultActiveKey={[]}
                                        expandIconPosition="right"
                                    >
                                        <Panel
                                            forceRender
                                            header="Name Details"
                                            key="1"
                                        >
                                            <Row gutter={10}>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        label="English Name"
                                                        name="name_en"
                                                        color="black"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'input is required',
                                                            },
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="name_ku"
                                                        label="Kurdish Name"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="name_ar"
                                                        label="Arabic Name"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="name_tr"
                                                        label="Turkish Name"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </Col>

                                <Col md={12} xs={24}>
                                    <Form.Item
                                        label="Phone Number"
                                        name="phone_no"
                                        color="black"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>

                                <Col md={12} xs={24}>
                                    <Form.Item name="spoken_language" label="Spoken Languages">
                                        <Select
                                            mode="multiple"
                                            optionLabelProp="label"
                                            style={{ width: '100%' }}
                                            placeholder="Select Spoken Languages"
                                        >

                                            {spokenLanguagesEn
                                                .map((l) => (<Option key={l} value={l}>{l}</Option>))}

                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col lg={6} md={12} xs={24}>
                                    <Form.Item
                                        name="gender"
                                        label="Gender"
                                        initialValue="unspecified"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Choose"
                                            onChange={this.onGenderChange}
                                            allowClear
                                        >
                                            <Option value="male"> Male </Option>
                                            <Option value="female"> Female </Option>
                                            <Option value="other"> Other </Option>
                                            <Option value="unspecified"> Unspecified </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={12} xs={24}>
                                    <Form.Item
                                        name="birthdate"
                                        label="Birthdate"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            inputReadOnly={isMobile}
                                            style={{ width: '100%' }}
                                            format={dateFormat}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={12} xs={24}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={12} xs={24}>
                                    <Form.Item
                                        name="city_id"
                                        label="City"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <RemoteSelect
                                            endpoint="/admin/city/list"
                                            optiontext={
                                                (op) => op.name_en
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={12} xs={24}>
                                    <Form.Item
                                        name="country_id"
                                        label="Country"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <RemoteSelect
                                            endpoint="/admin/country/list"
                                            optiontext={
                                                (op) => op.name_en
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                            </Row>
                        </Col>
                        <Col span={24}>
                            <Divider orientation="left">Clinic Info</Divider>
                            <Row gutter={10}>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        label="English Clinic Name"
                                        name="clinic_name_en"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        label="Clinic Phone Number"
                                        name="clinic_phone_no"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        name="defualt_visit_type_id"
                                        label="Default visit Type"
                                    >
                                        <RemoteSelect
                                            endpoint="/admin/visittype/list"
                                            optiontext={
                                                (op) => op.name_en
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        label="Kurdish Clinic Name"
                                        name="clinic_name_ku"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        label="Arabic Clinic Name"
                                        name="clinic_name_ar"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item
                                        label="Turkish Clinic Name"
                                        name="clinic_name_tr"
                                        color="black"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Collapse
                                        style={{ margin: '10px 0' }}
                                        defaultActiveKey={[]}
                                        expandIconPosition="right"
                                    >
                                        <Panel
                                            forceRender
                                            header="Address Details"
                                            key="1"
                                        >
                                            <Row gutter={10}>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="address_title_en"
                                                        label="English Address"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="address_title_ku"
                                                        label="Kurdish Address"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="address_title_ar"
                                                        label="Arabic Address"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="address_title_tr"
                                                        label="Turkish Address"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </Col>
                                <Col span={24}>
                                    <Collapse
                                        style={{ margin: '10px 0' }}
                                        defaultActiveKey={[]}
                                        expandIconPosition="right"
                                    >
                                        <Panel
                                            forceRender
                                            header="Bio Details"
                                            key="1"
                                        >
                                            <Row gutter={10}>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="bio_en"
                                                        label="English Bio"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="bio_ku"
                                                        label="Kurdish Bio"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="bio_ar"
                                                        label="Arabic Bio"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="bio_tr"
                                                        label="Turkish Bio"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </Col>

                                <Col span={24}>
                                    <Collapse
                                        style={{ margin: '10px 0' }}
                                        defaultActiveKey={[]}
                                        expandIconPosition="right"
                                    >
                                        <Panel
                                            forceRender
                                            header="Certificates"
                                            key="1"
                                        >
                                            <Row gutter={10}>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="certificate_en"
                                                        label="Certificate in English"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="certificate_ku"
                                                        label="Certificate in Kurdish"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col md={12} xs={24}>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="certificate_ar"
                                                        label="Certificate in Arabic"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Input is required',
                                                            },
                                                        ]}
                                                        name="certificate_tr"
                                                        label="Certificate in Turkish"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </Col>

                                <Col span={24}>
                                    <Collapse
                                        onChange={this.reinvMapSize}
                                        defaultActiveKey={[]}
                                        expandIconPosition="right"
                                        style={{ margin: '10px 0' }}

                                    >
                                        <Panel
                                            forceRender
                                            header="Map"
                                            key="1"
                                        >
                                            <Map
                                                ref={this.mapRef}
                                                style={{ height: '400px', width: '100%' }}
                                                center={position}
                                                zoom={13}
                                                onClick={this.handleMapClick}
                                            >
                                                <TileLayer
                                                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Marker
                                                    position={position}
                                                />
                                            </Map>
                                        </Panel>
                                    </Collapse>
                                </Col>
                                <Col span={24}>
                                    <Collapse
                                        expandIconPosition="right"
                                        style={{ margin: '10px 0' }}
                                    >
                                        <Panel forceRender header="Receipt Details" key="1">
                                            <Row gutter={10}>
                                                <Col span={11}>

                                                    <Divider>
                                                        Receipt Header
                                                    </Divider>
                                                    {data.receipt_header ? (
                                                        <Row
                                                            justify="center"
                                                            style={{
                                                                margin: 10,
                                                            }}
                                                        >
                                                            <Col>
                                                                <Image
                                                                    height={200}
                                                                    width={200}
                                                                    src={`${process.env.REACT_APP_API_LINK}/files/${data.receipt_header}`}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    ) : null}
                                                    <Form.Item name="header">
                                                        <BinaryUploader
                                                            onChange={(v) => this.onHeaderChange(v)}
                                                            maxFileCount={1}
                                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2} />
                                                <Col span={11}>
                                                    <Divider>
                                                        Receipt Footer
                                                    </Divider>
                                                    {data.receipt_footer ? (
                                                        <Row
                                                            justify="center"
                                                            style={{
                                                                margin: 10,
                                                            }}
                                                        >
                                                            <Col>
                                                                <Image
                                                                    height={200}
                                                                    width={200}
                                                                    src={`${process.env.REACT_APP_API_LINK}/files/${data.receipt_footer}`}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    ) : null}
                                                    <Form.Item name="footer">
                                                        <BinaryUploader
                                                            onChange={(v) => this.onFooterChange(v)}
                                                            maxFileCount={1}
                                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </Col>
                            </Row>

                            <Row gutter={12}>

                                <Col md={6} xs={24}>
                                    <Form.Item
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                        name="schedule_ahead"
                                        label="Schedule ahead in days"
                                    >
                                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col md={6} xs={24}>
                                    <Form.Item
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                        name="examination_fee"
                                        label="Examination Fee"
                                    >
                                        <InputNumber step={5000} min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col md={6} xs={24}>
                                    <Form.Item
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                        name="max_chat_limit"
                                        label="Max chat limit"
                                    >
                                        <InputNumber step={1} min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>

                                <Col md={3} xs={24}>
                                    <Form.Item
                                        d
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                        name="shift_start_from"
                                        label="Shift starts at"
                                    >
                                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                                    </Form.Item>
                                </Col>
                                <Col md={3} xs={24}>
                                    <Form.Item
                                        d
                                        rules={[
                                            {
                                                required: true,
                                                message: 'input is required',
                                            },
                                        ]}
                                        name="shift_end_at"
                                        label="Shift ends at"
                                    >
                                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={12} style={{ marginBottom: 20 }}>
                        <Col span={24}>
                            <Collapse>
                                <Panel
                                    forceRender
                                    header="Telemedicine Pricing"
                                    key="11239"
                                >
                                    <Form.List name="telemedicine_pricing">
                                        {(telemedicine_pricing, { add, remove }) => {
                                            return (
                                                <div>
                                                    {telemedicine_pricing.map((field, index) => (
                                                        <div key={field.key} style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Form.Item
                                                                style={{ flex: 5 }}
                                                                name={[index, "duration"]}
                                                                label="Duration"
                                                                rules={[{ required: true }]}
                                                            >
                                                                <TimePicker format="HH:mm" style={{ width: '95%' }}/>
                                                            </Form.Item>
                                                            <Form.Item
                                                                style={{ flex: 5 }}
                                                                label="Rate"
                                                                name={[index, "rate"]}
                                                                rules={[{ required: true }]}
                                                            >
                                                                <InputNumber min={1} style={{ width: '95%' }} />
                                                            </Form.Item>

                                                            <Button
                                                                style={{ flex: 1 }}
                                                                type="danger"
                                                                className="dynamic-delete-button"
                                                                onClick={() => remove(field.name)}
                                                                icon={<MinusCircleOutlined />}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Divider />
                                                    <Form.Item>
                                                        <Button
                                                            type="dashed"
                                                            onClick={() => add()}
                                                            style={{ width: "60%" }}
                                                        >
                                                            <PlusCircleOutlined /> Add Field
                                                        </Button>
                                                    </Form.Item>
                                                </div>
                                            );
                                        }}
                                    </Form.List>
                                </Panel>
                            </Collapse>
                        </Col>
                    </Row>

                    <Row justify="end" gutter={10}>
                        <Col offset={16} xs={24} sm={24} md={12} lg={8} xl={8}>
                            <Button size="middle" loading={saving} icon={<FormOutlined />} type="primary" htmlType="submit" block>
                                Update Profile
                            </Button>
                        </Col>
                    </Row>

                    <Col span={24}>
                        <VtypesAndSpeciality docId={resourceId} />
                    </Col>
                </Form>
            </>
        );
    }
}

export default Edit;
