import type {
  Agent as HttpAgent,
  AgentOptions as HttpAgentOptions,
} from 'http';
import type {
  Agent as HttpsAgent,
  AgentOptions as HttpsAgentOptions,
} from 'https';
import type {
  Socket,
} from 'net';
import type {
  TLSSocket,
} from 'tls';

export type ProxyConfigurationType = {
  authorization: string | null,
  hostname: string,
  port: number,
};

export type TlsConfigurationType = {
  ca?: string,
  cert?: string,
  ciphers?: string,
  clientCertEngine?: string,
  crl?: string,
  dhparam?: string,
  ecdhCurve?: string,
  honorCipherOrder?: boolean,
  key?: string,
  passphrase?: string,
  pfx?: string,
  rejectUnauthorized?: boolean,
  secureOptions?: number,
  secureProtocol?: string,
  servername?: string,
  sessionIdContext?: string,
};

export type ConnectionConfigurationType = {
  host: string,
  port: number,
  tls?: TlsConfigurationType,
  proxy: ProxyConfigurationType,
};

export type ConnectionCallbackType = (error: Error | null, socket?: Socket | TLSSocket) => void;

export type AgentType = HttpAgent | HttpsAgent;
export type IsProxyConfiguredMethodType = () => boolean;
export type MustUrlUseProxyMethodType = (url: string) => boolean;
export type GetUrlProxyMethodType = (url: string) => ProxyConfigurationType;
export type ProtocolType = 'http:' | 'https:';

export type ProxyAgentConfigurationInputType = {
  environmentVariableNamespace?: string,
  forceGlobalAgent?: boolean,
  socketConnectionTimeout?: number,
};

export type ProxyAgentConfigurationType = {
  environmentVariableNamespace: string,
  forceGlobalAgent: boolean,
  socketConnectionTimeout: number,
};

type CustomAgentOptions = {
  noProxy?: boolean,
};

export type ExtendedHttpAgentOptions = CustomAgentOptions & HttpAgentOptions;

export type GlobalAgentHttpAgent = CustomAgentOptions & HttpAgent & {
  options: ExtendedHttpAgentOptions,
};

export type ExtendedHttpsAgentOptions = CustomAgentOptions & HttpsAgentOptions;

export type GlobalAgentHttpsAgent = CustomAgentOptions & HttpsAgent & {
  options: ExtendedHttpsAgentOptions,
};

export type ExtendedAgentOptions = ExtendedHttpAgentOptions | ExtendedHttpsAgentOptions;
export type AgentWithNoProxy = GlobalAgentHttpAgent | GlobalAgentHttpsAgent;
