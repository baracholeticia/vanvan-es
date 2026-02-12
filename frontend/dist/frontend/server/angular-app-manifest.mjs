
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-RAZBYHLA.js"
    ],
    "route": "/login"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 8410, hash: 'c5633847b2c15446f0072344d2ef3b379ee1982799d80ff66b906cd012ee9b13', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 997, hash: '8c1ee7e444d3e45619f39b16bfe7a7d4960aecb8310519df0df6b40bc4854f1e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 21603, hash: '7069c24229a4dd6f5c195accbc9bee21e91acf5ae69a331b67b0c373ef5da3c6', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-JR2U2JYC.css': {size: 19478, hash: '1C5YHvjm7Kw', text: () => import('./assets-chunks/styles-JR2U2JYC_css.mjs').then(m => m.default)}
  },
};
