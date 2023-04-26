/* eslint-disable react/destructuring-assignment */
import React, { Suspense } from 'react';

import { observer, inject } from 'mobx-react';
import {
    Layout, Menu, Button, Col,
    Popover, List, Avatar,
} from 'antd';
import {
    MenuOutlined,
    SolutionOutlined,
    UserOutlined,
    UserAddOutlined,
    BankOutlined,
    EyeOutlined,
    AppstoreAddOutlined,
    SisternodeOutlined,
    BookOutlined,
    ContainerOutlined,
    AuditOutlined,
    HomeOutlined,
    FormOutlined,
    LogoutOutlined,
    FileDoneOutlined,
    InfoCircleOutlined,
    CommentOutlined,
    FileProtectOutlined,
    TagsOutlined,
    NotificationOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';

import {
    Switch, Route, Link, withRouter,
} from 'react-router-dom';
import debounce from 'lodash/debounce';
import Loading from '../basic/Loading';
import routes from './dashboardRoutes';
import largeLogo from '../../assets/images/Main on black@4x.png';

import './dashboard.css';

const {
    Header, Content, Footer, Sider,
} = Layout;
const { SubMenu } = Menu;

@observer
@inject('userStore', 'tokenStore', 'sectionsStore')
class Dashboard extends React.Component {
    constructor() {
        super();
        this.initialState = () => ({
            collapsed: false,
            windowsWidth: 0,
            defualtMenu: 'visitlist',
            UIFlags: {},
        });
        this.state = this.initialState();

        this.routeClicked = (history, to) => {
            history.push(to);
        };
        this.toggleSidebar = () => {
            this.setState((prevState) => ({
                collapsed: !prevState.collapsed,
            }));
        };
        this.logout = () => {
            const { userStore, tokenStore, sectionsStore } = this.props;
            Promise.all([
                userStore.clear(),
                tokenStore.clear(),
                sectionsStore.clear(),
            ]).then(() => { });
        };

        this.updateDimensions = debounce(() => {
            this.setState({ windowsWidth: window.innerWidth });
            const { windowsWidth } = this.state;
            if (windowsWidth < 992) {
                this.setState({ collapsed: true });
            } else {
                this.setState({ collapsed: false });
            }
        }, 300);
    }

    componentDidMount() {
        this.setState({
            UIFlags: this.props.userStore.value.role_data
                ? (this.props.userStore.value.role_data.UIFlags || {}) : {},
        });
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const {
            collapsed, UIFlags,
        } = this.state;
        const { location } = this.props;

        return (
            <>
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider
                        theme="dark"
                        style={{
                            height: '100vh',
                            left: 0,
                            position: 'fixed',
                            overflow: 'auto',
                            background: '#2d3546',
                        }}
                        width={collapsed ? 0 : 240}
                    >
                        <div
                            className="logo"
                            style={{
                                padding: 21,
                                textAlign: 'center',
                                background: '#1f2532',
                            }}
                        >
                            <img alt="app-logo" style={{ width: 140 }} src={largeLogo} />
                        </div>
                        <Menu
                            theme="dark"
                            selectedKeys={[location.pathname]}
                            mode="vertical"
                            style={{ background: '#2d3646', marginTop: 35 }}
                        >
                            {UIFlags.admindoctorlist ? (
                                <Menu.Item key="/">
                                    <UserAddOutlined />
                                    Doctor
                                    <Link to="/" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminvisitlist ? (
                                <Menu.Item key="/visit">
                                    <AuditOutlined />
                                    Visit
                                    <Link to="/visit" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminvisitlist ? (
                                <Menu.Item key="/telemedicine-visit">
                                    <VideoCameraOutlined />
                                     Telemedicine Visit
                                    <Link to="/telemedicine-visit" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminorderlist ? (
                                <Menu.Item key="/order">
                                    <FormOutlined />
                                    Order
                                    <Link to="/order" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminconsultancylist ? (
                                <Menu.Item key="/consultation">
                                    <CommentOutlined />
                                    Chat Consultation
                                    <Link to="/consultation" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminfeedback ? (
                                <Menu.Item key="/feedback">
                                    <FileProtectOutlined />
                                    Feedback
                                    <Link to="/feedback" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminhomeservice ? (
                                <Menu.Item key="/homeservice">
                                    <HomeOutlined />
                                    Home Service
                                    <Link to="/homeservice" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminpatientlist ? (
                                <Menu.Item key="/patient">
                                    <SolutionOutlined />
                                    Patient
                                    <Link to="/patient" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminpatientlist ? (
                                <Menu.Item key="/pushNotification">
                                    <NotificationOutlined />
                                    Communications
                                    <Link to="/pushNotification" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminarticlelist || UIFlags.adminarticlecategorylist ? (
                                <SubMenu key="sub1" icon={<BookOutlined />} title="Articles">
                                    {UIFlags.adminarticlelist ? (
                                        <Menu.Item key="/article-list">
                                            <ContainerOutlined />
                                            Article list
                                            <Link to="/article-list" />
                                        </Menu.Item>
                                    ) : null}
                                    {UIFlags.adminarticlecategorylist ? (
                                        <Menu.Item key="/category">
                                            <AppstoreAddOutlined />
                                            Categories
                                            <Link to="/category" />
                                        </Menu.Item>
                                    ) : null}
                                </SubMenu>
                            ) : null}
                            {UIFlags.adminvisittypelist ? (
                                <Menu.Item key="/visit-type">
                                    <EyeOutlined />
                                    Visit Type
                                    <Link to="/visit-type" />
                                </Menu.Item>
                            ) : null}

                            {UIFlags.adminspecialitylist ? (
                                <Menu.Item key="/speciality">
                                    <SisternodeOutlined />
                                    Speciality
                                    <Link to="/speciality" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.adminmedicaltiplist ? (
                                <Menu.Item key="/medical-tips">
                                    <InfoCircleOutlined />
                                    Medical Tips
                                    <Link to="/medical-tips" />
                                </Menu.Item>
                            ) : null}

                            <Menu.Item key="/labels">
                                <TagsOutlined />
                                Labels
                                <Link to="/labels" />
                            </Menu.Item>

                            {UIFlags.adminbotsurvey ? (
                                <Menu.Item key="/survey">
                                    <FileDoneOutlined />
                                    <span>Bot Survey</span>
                                    <Link to="/survey" />
                                </Menu.Item>
                            ) : null}
                            {UIFlags.admincitylist ? (
                                <Menu.Item key="/city">
                                    <BankOutlined />
                                    City
                                    <Link to="/city" />
                                </Menu.Item>
                            ) : null}

                            {UIFlags.adminuserlist ? (
                                <Menu.Item key="/user">
                                    <UserOutlined />
                                    User
                                    <Link to="/user" />
                                </Menu.Item>
                            ) : null}

                        </Menu>

                    </Sider>
                    <Layout
                        className="site-layout"
                        style={{
                            transition: 'all 0.2s',
                            marginLeft: collapsed ? 0 : 240,
                        }}
                    >
                        <Header
                            className="site-layout-background"
                            style={{ padding: 0, display: 'inherit' }}
                        >
                            <Col span={12} style={{ textAlign: 'start', paddingLeft: 10 }}>
                                <Button
                                    type="link"
                                    icon={
                                        <MenuOutlined style={{ fontSize: 15, color: '#1f2532' }} />
                                    }
                                    onClick={this.toggleSidebar}
                                />
                            </Col>
                            <Col span={12} style={{ textAlign: 'end', paddingRight: 15 }}>
                                <Popover
                                    content={(
                                        <List>
                                            <List.Item>
                                                <Button
                                                    onClick={this.logout}
                                                    icon={<LogoutOutlined />}
                                                    danger
                                                    type="link"
                                                    block
                                                >
                                                    Logout
                                                </Button>
                                            </List.Item>
                                        </List>
                                    )}
                                    trigger="hover"
                                    arrowPointAtCenter
                                    placement="bottomLeft"
                                >
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) -1px 0px 8px 0px, rgba(0, 0, 0, 0.19) 0px 6px 20px 0px' }}
                                    />
                                </Popover>

                            </Col>
                        </Header>
                        <Content style={{ margin: '16px 16px', marginBottom: 0 }}>
                            <div
                                className="site-layout-background"
                                style={{ padding: 24, minHeight: 500 }}
                            >
                                <Suspense fallback={<Loading />}>
                                    <Switch>
                                        {routes.map((route) => (
                                            <Route
                                                exact={route.exact}
                                                key={route.key}
                                                path={`${route.path}`}
                                            >
                                                <route.component />
                                            </Route>
                                        ))}
                                    </Switch>
                                </Suspense>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </>
        );
    }
}

export default withRouter((props) => <Dashboard {...props} />);
