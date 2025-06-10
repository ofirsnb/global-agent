import http from 'http';
import https from 'https';
import type {
  ExtendedHttpAgentOptions,
  ExtendedHttpsAgentOptions,
  GlobalAgentHttpAgent,
  GlobalAgentHttpsAgent,
  AgentWithNoProxy,
} from '../types';

type CreateAgentReturn<T extends 'http' | 'https'> = T extends 'http' ? GlobalAgentHttpAgent : GlobalAgentHttpsAgent;

export const createAgent = <T extends 'http' | 'https'>(
  options: T extends 'http' ? ExtendedHttpAgentOptions : ExtendedHttpsAgentOptions,
  protocol: T,
): CreateAgentReturn<T> => {
  const agent = protocol === 'http' ?
    new http.Agent(options as ExtendedHttpAgentOptions) :
    new https.Agent(options as ExtendedHttpsAgentOptions);
  const extendedAgent = agent as AgentWithNoProxy;

  if (options.noProxy !== undefined) {
    extendedAgent.noProxy = options.noProxy;
  }

  return extendedAgent as CreateAgentReturn<T>;
};

export const createHttpAgent = (options: ExtendedHttpAgentOptions = {}): GlobalAgentHttpAgent => {
  return createAgent(options, 'http');
};

export const createHttpsAgent = (options: ExtendedHttpsAgentOptions = {}): GlobalAgentHttpsAgent => {
  return createAgent(options, 'https');
};
