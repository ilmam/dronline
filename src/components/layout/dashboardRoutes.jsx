import { lazy } from 'react';

const options = [
    {
        key: Math.random(),
        path: '/',
        component: lazy(() => import('../doctor/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/patient',
        component: lazy(() => import('../patient/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/pushNotification',
        component: lazy(() => import('../pushNotification/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/city',
        component: lazy(() => import('../city/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/user',
        component: lazy(() => import('../user/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/category',
        component: lazy(() => import('../category/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/order',
        component: lazy(() => import('../order/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/homeservice',
        component: lazy(() => import('../homeservice/HomeService')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/speciality',
        component: lazy(() => import('../speciality/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/medical-tips',
        component: lazy(() => import('../medicalTip/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/survey',
        component: lazy(() => import('../survey/SurveyList')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/visit',
        component: lazy(() => import('../visit/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/telemedicine-visit',
        component: lazy(() => import('../visit/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/visit-type',
        component: lazy(() => import('../visitType/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/article-list',
        component: lazy(() => import('../articles/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/consultation',
        component: lazy(() => import('../consultation/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/feedback',
        component: lazy(() => import('../feedback/List')),
        exact: true,
    },
    {
        key: Math.random(),
        path: '/labels',
        component: lazy(() => import('../labels/List')),
        exact: true,
    },
];
export default options;
