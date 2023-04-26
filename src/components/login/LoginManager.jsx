import React from 'react';
import {
  Row, Col, Card, Typography,
} from 'antd';
import { observer, inject } from 'mobx-react';
import debounce from 'lodash/debounce';
import sideImage from '../../assets/images/Profile Picture3@4x.png';
import Login from './Login';

@inject('userStore', 'tokenStore', 'sectionsStore')
@observer
class LoginManager extends React.Component {
  constructor() {
    super();
    this.initialState = () => ({

      windowsWidth: 0,
    });

    this.state = this.initialState();

    this.updateDimensions = debounce(() => {
      this.setState({ windowsWidth: window.innerWidth });
    }, 300);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    const { windowsWidth } = this.state;

    const { tokenStore, to } = this.props;
    if (`${tokenStore.value}`.trim() !== '') {
      return to;
    }
    return (
      <Row
        style={{ position: 'absolute', height: '100%', width: '100%' }}
        type="flex"
        align="middle"
      >
        <Col
          lg={15}
          md={12}
          sm={0}
          xs={0}
          style={{ backgroundColor: '#1e2832', height: '100%' }}
        >
          <div
            style={{
              height: '50%',
              position: 'absolute',
              width: '80%',
              right: 0,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url('${sideImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          >
            
          </div>
        </Col>
        <Col lg={9} md={12} sm={24} xs={24}>
          <Row>
            <Col span={24}>
              <Typography.Title
                align="center"
                color="primary"
                style={{ color: '#34d698', letterSpacing: '1.5px' }}
              >
                Admin Dashboard
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Card bordered={false}>
                <Login />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default LoginManager;
