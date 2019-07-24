import React from 'react';
import request from 'superagent';
import _ from 'lodash';
import qs from 'qs';

import { notification, Icon } from 'antd';


const basicConfig = (keep, duration = 3) => ({
    duration: keep ? null : duration,
    icon: <Icon type="check-circle" style={{ color: 'green' }} />,
    placement: 'bottomRight',
});

const notify = {
    error: (message, description, keepActive, duration) => {
        notification.error({
            ...basicConfig(keepActive, duration),
            icon: <Icon type="close-circle" style={{ color: 'red' }} />,
            message,
            description,
        });
    },
    success: (message, description, keepActive, duration) => {
        notification.success({
            ...basicConfig(keepActive, duration),
            message,
            description,
        });
    },
    fileWarning: (message, description, keepActive, duration) => {
        notification.warning({
            ...basicConfig(keepActive, duration),
            icon: <Icon type="file-exclamation" theme="twoTone" twoToneColor="#fadb14" />,
            message,
            description,
        });
    },
    info: (message, description, keepActive, duration) => {
        notification.info({
            ...basicConfig(keepActive, duration),
            message,
            description,
        });
    },
};


const allowedMethods = ['get', 'post', 'put', 'delete'];
const allowedFormMethods = ['post', 'put'];

export default function fetch(rawMethod = '', url = '', data = {}, stringify = false) {
    const method = String(rawMethod).toLowerCase();
    const exec = request[method];
    if(!_.includes(allowedMethods, method)) {
        return Promise.reject(`Not valid method "${rawMethod}"`);
    }
    const handler = (data) => {
        if(!data.ok) throw data.body;
        return data.body;
    };
    if(method === 'get') {
        const queryObj = stringify ? qs.stringify(data) : data;
        return exec(url)
            .query(queryObj)
            .then(handler);
    }
    if(method === 'delete') {
        return exec(url)
            .then(handler);
    }
    return exec(url)
        .type('json')
        .send(data)
        .then(handler);
}

export default class SafeFetch {

    static ERROR = 'ERROR';
    static defaultErrorHandler(err) { notify.error('Error', JSON.stringify(err)); }

    constructor(errorHandler = SafeFetch.defaultErrorHandler, handleError = true) {
        this.errorHandler = errorHandler;
        this.handleError = handleError;
    }

    fetch(method, url = '', obj = {}) {
        return fetch(method, url, obj).catch((err) => {
            if(this.handleError) {
                this.errorHandler(err);
            }
            return SafeFetch.ERROR;
        });
    }

    get(url, obj) {
        return this.fetch('GET', url, obj);
    }

    put(url, obj) {
        return this.fetch('PUT', url, obj);
    }

    post(url, obj) {
        return this.fetch('POST', url, obj);
    }

    delete(url, obj) {
        return this.fetch('DELETE', url, obj);
    }

    multiple(...requestsParams) {
        return Promise
            .all(requestsParams.map(reqParams => fetch(...reqParams)))
            .catch((err) => {
                this.errorHandler(err);
                return SafeFetch.ERROR;
            });
    }

    static isError(result) {
        return result === SafeFetch.ERROR;
    }

}
