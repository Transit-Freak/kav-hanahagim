# Dependency and service licensing policy

User requirement: use only open-source libraries permitting commercial use.
Applies to every future change in this repository, including code, fonts, icons,
bundled assets and build dependencies. Preserve all required license notices.

Before adding or upgrading a dependency:
- Verify the exact version and original license from the publisher.
- Record version, source, SPDX identifier and notice path in THIRD_PARTY.md.
- Do not accept noncommercial, personal-only, source-available-only or unknown licenses.
- Check copyleft obligations for the actual distribution model; do not strip them.
- Check hosted-service terms independently, including vehicle navigation rights.
- Public accessibility, free pricing and an API that works are not permission.
- Do not configure CARTO, Esri imagery or a public routing demo as implicit fallbacks.
- Never label the whole project legally cleared while data or hosting rights remain unresolved.

The pending service migration must not be deployed with empty tile configuration.
Complete the deployment checks in docs/open-services-migration.md first.
Do not change or relicense user-owned code or unrelated websites.
