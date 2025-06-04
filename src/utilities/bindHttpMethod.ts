import http from 'http';
import https from 'https';

type AgentType = http.Agent | https.Agent;

export type AgentWithMethods = AgentType & {
  addRequest: (request: http.ClientRequest, options: any) => void,
  createConnection: (options: any, callback: (error: Error | null, socket: any) => void) => void,
};

const mergeAgents = (proxyAgent: AgentWithMethods, customAgent: AgentType): AgentWithMethods => {
  const mergedAgent = Object.create(proxyAgent) as AgentWithMethods;

  // Properties that must NOT be copied because they would break proxy functionality
  const excludedProperties = new Set([
    // Core proxy methods - these must come from the proxy agent
    'addRequest',
    'createConnection',

    // Internal Node.js agent state that shouldn't be copied
    '_events',
    '_eventsCount',
    '_maxListeners',
    'requests',
    'sockets',
    'freeSockets',
    'totalSocketCount',

    // Prototype-related properties
    'constructor',
    '__proto__',

    // Node.js internal symbols and properties
    'Symbol(shapeMode)',
    'Symbol(kCapture)',
  ]);

  Object.getOwnPropertyNames(customAgent).forEach((property) => {
    if (!excludedProperties.has(property)) {
      const descriptor = Object.getOwnPropertyDescriptor(customAgent, property);
      if (descriptor?.value !== undefined) {
        Object.defineProperty(mergedAgent, property, {
          configurable: descriptor.configurable ?? true,
          enumerable: descriptor.enumerable ?? true,
          value: descriptor.value,
          writable: descriptor.writable ?? true,
        });
      }
    }
  });

  mergedAgent.addRequest = proxyAgent.addRequest;
  mergedAgent.createConnection = proxyAgent.createConnection;

  return mergedAgent;
};

export default (
  originalMethod: Function,
  agent: AgentWithMethods,
  forceGlobalAgent: boolean,
) => {
  return (...args: any[]) => {
    let url;
    let options;
    let callback;

    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      url = args[0];

      if (typeof args[1] === 'function') {
        options = {};
        callback = args[1];
      } else {
        options = {
          ...args[1],
        };
        callback = args[2];
      }
    } else {
      options = {
        ...args[0],
      };
      callback = args[1];
    }

    if (forceGlobalAgent) {
      options.agent = agent;
    } else if (!options.agent) {
      options.agent = agent;
    } else if (options.agent === http.globalAgent || options.agent === https.globalAgent) {
      options.agent = agent;
    } else {
      options.agent = mergeAgents(agent, options.agent);
    }

    if (url) {
      return originalMethod(url, options, callback);
    } else {
      return originalMethod(options, callback);
    }
  };
};
