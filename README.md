# @ofirsnb/global-agent

[![NPM version](http://img.shields.io/npm/v/@ofirsnb/global-agent.svg?style=flat-square)](https://www.npmjs.org/package/@ofirsnb/global-agent)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg?style=flat-square)](https://github.com/ofirsnb/global-agent/blob/master/LICENSE)

fork of [global-agent](https://github.com/gajus/global-agent) to improve its capabilities.

Global HTTP/HTTPS proxy configurable using environment variables.

* [Installation](#installation)
* [Usage](#usage)
  * [Setup proxy using `@ofirsnb/global-agent/bootstrap`](#setup-proxy-using-global-agentbootstrap)
  * [Setup proxy using `bootstrap` routine](#setup-proxy-using-bootstrap-routine)
  * [Runtime configuration](#runtime-configuration)
  * [Exclude URLs](#exclude-urls)
  * [Disable Proxy per request basis](#disable-proxy-per-request-basis)
  * [Enable logging](#enable-logging)
* [API](#api)
  * [`createGlobalProxyAgent`](#createglobalproxyagent)
  * [Environment variables](#environment-variables)
  * [`global.GLOBAL_AGENT`](#globalglobal_agent)
* [Supported libraries](#supported-libraries)
* [FAQ](#faq)
  * [What is the reason `@ofirsnb/global-agent/bootstrap` does not use `HTTP_PROXY`?](#what-is-the-reason-ofirsnbglobal-agentbootstrap-does-not-use-http_proxy)
* [Contributing](#contributing)

## Installation
`npm i @ofirsnb/global-agent`

## Usage

### Setup proxy using `@ofirsnb/global-agent/bootstrap`

To configure HTTP proxy:

1. Import `@ofirsnb/global-agent/bootstrap`.
1. Export HTTP proxy address as `GLOBAL_AGENT_HTTP_PROXY` environment variable.

Code:

```js
import '@ofirsnb/global-agent/bootstrap';

// or:
// import {bootstrap} from '@ofirsnb/global-agent';
// bootstrap();

```

Bash:

```bash
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080

```

Alternatively, you can preload module using Node.js `--require, -r` configuration, e.g.

```bash
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
$ node -r '@ofirsnb/global-agent/bootstrap' your-script.js

```

### Setup proxy using `bootstrap` routine

Instead of importing a self-initialising script with side-effects as demonstrated in the [setup proxy using `@ofirsnb/global-agent/bootstrap`](#setup-proxy-using-global-agentbootstrap) documentation, you can import `bootstrap` routine and explicitly evaluate the bootstrap logic, e.g.

```js
import {
  bootstrap
} from '@ofirsnb/global-agent';

bootstrap();

```

This is useful if you need to conditionally bootstrap `@ofirsnb/global-agent`, e.g.

```js
import {
  bootstrap
} from '@ofirsnb/global-agent';
import globalTunnel from 'global-tunnel-ng';

const MAJOR_NODEJS_VERSION = parseInt(process.version.slice(1).split('.')[0], 10);

if (MAJOR_NODEJS_VERSION >= 16) {
  // `@ofirsnb/global-agent` works with Node.js v16 and above.
  bootstrap();
} else {
  // `global-tunnel-ng` works only with Node.js v10 and below.
  globalTunnel.initialize();
}

```

### Setup proxy using `createGlobalProxyAgent`

If you do not want to use `global.GLOBAL_AGENT` variable, then you can use `createGlobalProxyAgent` to instantiate a controlled instance of `@ofirsnb/global-agent`, e.g.

```js
import {
  createGlobalProxyAgent
} from '@ofirsnb/global-agent';

const globalProxyAgent = createGlobalProxyAgent();

```

Unlike `bootstrap` routine, `createGlobalProxyAgent` factory does not create `global.GLOBAL_AGENT` variable and does not guard against multiple initializations of `@ofirsnb/global-agent`. The result object of `createGlobalProxyAgent` is equivalent to `global.GLOBAL_AGENT`.

### Runtime configuration

`@ofirsnb/global-agent/bootstrap` script copies `process.env.GLOBAL_AGENT_HTTP_PROXY` value to `global.GLOBAL_AGENT.HTTP_PROXY` and continues to use the latter variable.

You can override the `global.GLOBAL_AGENT.HTTP_PROXY` value at runtime to change proxy behaviour, e.g.

```js
http.get('http://127.0.0.1:8000');

global.GLOBAL_AGENT.HTTP_PROXY = 'http://127.0.0.1:8001';

http.get('http://127.0.0.1:8000');

global.GLOBAL_AGENT.HTTP_PROXY = 'http://127.0.0.1:8002';

```

The first HTTP request is going to use http://127.0.0.1:8001 proxy and the second request is going to use http://127.0.0.1:8002.

All `@ofirsnb/global-agent` configuration is available under `global.GLOBAL_AGENT` namespace.

### Passing custom Agent along with the request
```js
import axios from 'axios';
import { Agent } from 'node:https';
import {
  bootstrap
} from '@ofirsnb/global-agent';

bootstrap({ forceGlobalAgent: false });

const httpsAgent = new Agent({
  rejectUnauthorized: false,
  maxFreeSockets: 128,
  timeout: 100,
});
axios.get('https://127.0.0.1:8000', {
  httpsAgent,
});
```
The request will be proxied (if applicable) while maintaining the custom agent configuration. Must be configured with `forceGlobalAgent: false`.

### Exclude URLs

The `GLOBAL_AGENT_NO_PROXY` environment variable specifies a pattern of URLs that should be excluded from proxying. `GLOBAL_AGENT_NO_PROXY` value is a comma-separated list of domain names. Asterisks can be used as wildcards, e.g.

```bash
export GLOBAL_AGENT_NO_PROXY='*.foo.com,baz.com'

```

says to contact all machines with the 'foo.com' TLD and 'baz.com' domains directly.

### Disable Proxy per request basis
```js
import axios from 'axios';
import {
  bootstrap,
  createHttpsAgent
} from '@ofirsnb/global-agent';

bootstrap({ forceGlobalAgent: false });

const httpsAgent = createHttpsAgent({
  noProxy: true,
  timeout: 1000,
});
axios.get('https://127.0.0.1:8000', {
  httpsAgent,
});
```

Typescript:
```typescript
import { createHttpsAgent, createAgent } from '@ofirsnb/global-agent';

const httpAgent = createHttpsAgent({
  timeout: 8000,
  rejectUnauthorized: true,
  noProxy: true,
});

// Alternate approach:
const httpAgent = createAgent({
  timeout: 8000,
  rejectUnauthorized: true,
  noProxy: true
}, 'https');
```
using `noProxy: true` the request won't be proxied, while using the given agent.


### Separate proxy for HTTPS

The environment variable `GLOBAL_AGENT_HTTPS_PROXY` can be set to specify a separate proxy for HTTPS requests. When this variable is not set `GLOBAL_AGENT_HTTP_PROXY` is used for both HTTP and HTTPS requests.

### Enable logging

`@ofirsnb/global-agent` is using [`roarr`](https://www.npmjs.com/package/roarr) logger to log HTTP requests and response (HTTP status code and headers), e.g.

```json
{"context":{"program":"@ofirsnb/global-agent","namespace":"Agent","logLevel":10,"destination":"http://gajus.com","proxy":"http://127.0.0.1:8076"},"message":"proxying request","sequence":1,"time":1556269669663,"version":"1.0.0"}
{"context":{"program":"@ofirsnb/global-agent","namespace":"Agent","logLevel":10,"headers":{"content-type":"text/plain","content-length":"2","date":"Fri, 26 Apr 2019 12:07:50 GMT","connection":"close"},"requestId":6,"statusCode":200},"message":"proxying response","sequence":2,"time":1557133856955,"version":"1.0.0"}

```

Export `ROARR_LOG=true` environment variable to enable log printing to stdout.

Use [`roarr-cli`](https://github.com/gajus/roarr-cli) program to pretty-print the logs.

## API

### `createGlobalProxyAgent`

```js
/**
 * @property environmentVariableNamespace Defines namespace of `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` environment variables. (Default: `GLOBAL_AGENT_`)
 * @property forceGlobalAgent Forces to use `@ofirsnb/global-agent` HTTP(S) agent even when request was explicitly constructed with another agent. (Default: `true`)
 * @property socketConnectionTimeout Destroys socket if connection is not established within the timeout. (Default: `60000`)
 */
type ProxyAgentConfigurationInputType = {|
  +environmentVariableNamespace?: string,
  +forceGlobalAgent?: boolean,
  +socketConnectionTimeout?: number,
|};

(configurationInput: ProxyAgentConfigurationInputType) => ProxyAgentConfigurationType;

```

### Environment variables

|Name|Description|Default|
|---|---|---|
|`GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE`|Defines namespace of `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` environment variables.|`GLOBAL_AGENT_`|
|`GLOBAL_AGENT_FORCE_GLOBAL_AGENT`|Forces to use `@ofirsnb/global-agent` HTTP(S) agent (only) even when request was explicitly constructed with another agent.|`true`|
|`GLOBAL_AGENT_SOCKET_CONNECTION_TIMEOUT`|Destroys socket if connection is not established within the timeout.|`60000`|
|`${NAMESPACE}HTTP_PROXY`|Sets the initial proxy controller HTTP_PROXY value.|N/A|
|`${NAMESPACE}HTTPS_PROXY`|Sets the initial proxy controller HTTPS_PROXY value.|N/A|
|`${NAMESPACE}NO_PROXY`|Sets the initial proxy controller NO_PROXY value.|N/A|

### `global.GLOBAL_AGENT`

`global.GLOBAL_AGENT` is initialized by `bootstrap` routine.

`global.GLOBAL_AGENT` has the following properties:

|Name|Description|Configurable|
|---|---|---|
|`HTTP_PROXY`|Yes|Sets HTTP proxy to use.|
|`HTTPS_PROXY`|Yes|Sets a distinct proxy to use for HTTPS requests.|
|`NO_PROXY`|Yes|Specifies a pattern of URLs that should be excluded from proxying. See [Exclude URLs](#exclude-urls).|

## Supported libraries

`@ofirsnb/global-agent` works with all libraries that internally use [`http.request`](https://nodejs.org/api/http.html#http_http_request_options_callback).

`@ofirsnb/global-agent` has been tested to work with:

* [`got`](https://www.npmjs.com/package/got)
* [`axios`](https://www.npmjs.com/package/axios)
* [`request`](https://www.npmjs.com/package/request)

`@ofirsnb/global-agent` supports Node.js v16 and above, and does not implements workarounds for the older Node.js versions. 


## FAQ

### What is the reason `@ofirsnb/global-agent/bootstrap` does not use `HTTP_PROXY`?

Some libraries (e.g. [`request`](https://npmjs.org/package/request)) change their behaviour when `HTTP_PROXY` environment variable is present. Using a namespaced environment variable prevents conflicting library behaviour.

You can override this behaviour by configuring `GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE` variable, e.g.

```bash
$ export GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=

```

Now script initialized using `@ofirsnb/global-agent/bootstrap` will use `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` environment variables.

## Contribution

If you want to contribute to the project and make it better, your help is very welcome.

If you liked the project and/or find it useful, please consider giving us a **star** on GitHub to support the project and help others discover it.

This project was possible due to the great work of [Gajus Kuizinas](http://gajus.com/) author of `global-agent`.

