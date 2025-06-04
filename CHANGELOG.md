# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2025-01-04

### **BREAKING CHANGES**
- `global-agent` now works only on NodeJS > 16.0 . Previous NodeJS version are unsupported.

### Improved
- **Proxy while using Custom Agent**: Previously,  when the request had a custom http/s agent,  the request would not be proxied at all by the `global-agent`.  Now, if a custom agent was passed in the request,  the request will be proxied along with the custom agent.  Properties that will conflict with the proxy (such as `proxy: `) are ignored.

---
