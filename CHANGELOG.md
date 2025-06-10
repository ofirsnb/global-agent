# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.6]

### Fixed
- Fixed TLS certificate validation issues (`ERR_TLS_CERT_ALTNAME_INVALID`, `DEPTH_ZERO_SELF_SIGNED_CERT`) when using proxy
- Fixed `servername` in TLS configuration to always use target hostname instead of proxy hostname
- Resolving certificate validation errors where the certificate is for the target server but `servername` was incorrectly set to the proxy server hostname
- Avoiding RFC 6066 violation in modern NodeJS versions
- Excluded TLS-related properties from agent merging to prevent interference with proxy certificate validation
- Fixed logical operator in URL construction
- Fixed `rejectUnauthorized` being forced to `true` instead of respecting the original agent's setting


## [4.0.0]

### **BREAKING CHANGES**
- `global-agent` now works only on NodeJS > 16.0 . Previous NodeJS version are unsupported.

### Improved
- **Proxy while using Custom Agent**: Previously,  when the request had a custom http/s agent,  the request would not be proxied at all by the `global-agent`.  Now, if a custom agent was passed in the request,  the request will be proxied along with the custom agent.  Properties that will conflict with the proxy (such as `proxy: `) are ignored.

---
