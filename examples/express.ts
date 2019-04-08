import Provider from '../src/core/SolidIdp'

// new Provider instance with no extra configuration, will run in default, just needs the issuer
// identifier, uses data from runtime-dyno-metadata heroku here
const oidc = new Provider(`https://localhost:8443`, {})

// initialize with no keystores, dev ones will be provided
oidc.initialize({
  // just a foobar client to be able to start an Authentication Request
  clients: [{ client_id: 'foo', client_secret: 'bar', redirect_uris: ['http://lvh.me/cb'] }]
}).then(() => {
  // Heroku has a proxy in front that terminates ssl, you should trust the proxy.
  oidc.proxy = true

  // set the cookie signing keys (securekey plugin is taking care of those)
  oidc.keys = process.env.SECURE_KEY.split(',')

  // listen on the heroku generated port
  oidc.listen(8443)
})
