import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components';

const { pool } = window;

class XUsersView extends View {
  get template () {
    return require('./x-users-view.html');
  }

  get props () {
    return Object.assign({}, super.props, {
      users: {
        type: Array,
        value: () => ([]),
      },
    });
  }

  async focused () {
    super.focused();

    let resp = await pool.fetch('/user');
    this.set('users', await resp.json());
  }

  computeReadUri (user) {
    return `#!/user/${user.id}`;
  }
}

define('x-users-view', XUsersView);
