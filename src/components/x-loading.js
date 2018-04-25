import { define, Component } from '@xinix/xin';

import './x-loading.css';

let instance;

export class XLoading extends Component {
  static show ({ message } = {}) {
    let instance = this.getInstance();
    instance.show({ message });
    return instance;
  }

  static getInstance () {
    if (instance) {
      return instance;
    }

    instance = document.createElement('x-loading');
    document.body.appendChild(instance);

    return instance;
  }

  get props () {
    return Object.assign({}, super.props, {
      message: {
        type: String,
        value: 'Waiting ...',
      },
    });
  }

  get template () {
    return require('./x-loading.html');
  }

  show ({ message = 'Loading ...' } = {}) {
    this.set('message', message);
    this.classList.add('visible');
  }

  hide () {
    this.classList.remove('visible');
  }
}

define('x-loading', XLoading);
