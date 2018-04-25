
import { bootstrap } from '@xinix/xin';

(async function () {
  bootstrap({
    // 'customElements.version': 'v0',
    // 'env.debug': true,
    'view.transitionIn': 'none',
    'view.transitionOut': 'none',
    'view.loaders': [
      {
        test: /^x-/,
        load (view) {
          return import(`./views/${view.name}`);
        },
      },
    ],
  });

  await Promise.all([
    import('bootstrap/dist/css/bootstrap.css'),
    import('open-iconic/font/css/open-iconic-bootstrap.css'),
    import('./css/site.css'),
    import('bootstrap'),
    import('./components/x-app'),
  ]);

  document.addEventListener('started', () => {
    setTimeout(() => {
      document.body.removeAttribute('unresolved');
    }, 100);
  });
})();
