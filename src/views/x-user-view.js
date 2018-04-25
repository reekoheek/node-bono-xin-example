import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components';

import './x-user-view.css';

const { pool } = window;

class XUserView extends View {
  get template () {
    return require('./x-user-view.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      user: {
        type: Object,
        value: () => ({}),
      },
    });
  }

  async focused () {
    super.focused();

    this.set('user', {});

    let { id } = this.parameters;

    if (!id) {
      return;
    }

    let resp = await pool.fetch(`/user/${id}`);
    this.set('user', await resp.json());
  }

  async doSave (evt) {
    evt.preventDefault();

    let resp;
    if (this.user.id) {
      resp = await pool.fetch(`/user/${this.user.id}`, {
        method: 'PUT',
        body: JSON.stringify(this.user),
      });
    } else {
      resp = await pool.fetch('/user', {
        method: 'POST',
        body: JSON.stringify(this.user),
      });
    }

    if (resp.status > 201) {
      throw new Error('Resp status not 200 or 201');
    }

    this.__app.navigate('/user');
  }

  async doDelete (evt) {
    evt.preventDefault();

    let resp = await pool.fetch(`/user/${this.user.id}`, {
      method: 'DELETE',
    });

    if (resp.status !== 200) {
      throw new Error('Resp status not 200');
    }

    this.__app.navigate('/user');
  }
}

define('x-user-view', XUserView);
