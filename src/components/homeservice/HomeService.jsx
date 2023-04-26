import React from 'react';
import { Tabs } from 'antd';

import List from './results/List';
import CategoryList from './category/List';
import ItemList from './item/List';
import PackageList from './package/List';
import ProviderList from './provider/List';
import LoadAuthorizationData from '../LoadAuthorizationData';

const { TabPane } = Tabs;

class HomeService extends React.Component {
  constructor() {
    super();
    this.state = {
      ...LoadAuthorizationData(),
    };
  }

  render() {
    const { UIFlags } = this.state;
    return (
      <>
        <Tabs defaultActiveKey="1" centered type="card">
          <TabPane tab="Results" key="1">
            <List />
          </TabPane>
          {UIFlags.adminhomeservicepackagecategory ? (
            <TabPane tab="Package Category" key="2">
              <CategoryList />
            </TabPane>
          ) : null}
          {UIFlags.adminhomeservicepackage ? (
            <TabPane tab="Package" key="3">
              <PackageList />
            </TabPane>
          ) : null}
          {UIFlags.adminhomeservicepackageitem ? (
            <TabPane tab="Package Item" key="4">
              <ItemList />
            </TabPane>
          ) : null}
          {UIFlags.adminhomeserviceprovider ? (
            <TabPane tab="Provider" key="5">
              <ProviderList />
            </TabPane>
          ) : null}

        </Tabs>
      </>
    );
  }
}
export default HomeService;
