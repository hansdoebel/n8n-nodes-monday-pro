# n8n-nodes-monday-pro

## ⚠️ THIS NODE IS IN VERY EARLY STAGE

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This is a custom n8n community node providing an extended integration with Monday.com, including several additional features not covered by the official node.

It is an independent enhancement created for advanced workflow use cases.

---

## 📁 Features

- **Current API-Version: 2025-10**
- OAuth2 and API Token authentication

Create and manage:

- **Boards**
- **Board columns**
- **Board groups**
- **Board items** (+ with options to filter requested items and choose response data via JSON)
- **Subitems** *(new – not included in the official node!)*
- **Webhooks** *(new – not included in the official node!)*
- **Folders** *(new – not included in the official node!)*
- Update column values (single or multiple)
- Query items by column value
- Pagination support for large boards

This package is ideal if you want more control over Monday.com data or if you need functionality missing in the default n8n Monday node.

---

## 📦 Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes.**
2. Select **Install.**
3. Find the node you want to install:

   a.) Select **Browse**. n8n takes you to an npm search results page, showing all npm packages tagged with the keyword `n8n-community-node-package`.

   b.) Browse the list of results. You can filter the results or add more keywords.

   c.) Once you find the package you want, make a note of the package name. If you want to install a specific version, make a note of the version number as well.

   d.) Return to n8n.

4. Enter the npm package name, and version number if required.
5. Agree to the risks of using community nodes: select I understand the risks of installing unverified code from a public source.
6. Select Install. n8n installs the node, and returns to the Community Nodes list in Settings.

---

## 🔗 Resources

- [n8n Website](https://n8n.io/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Monday.com Website](https://monday.com/)
- [Monday.com Open API reference](https://developer.monday.com/api-reference/)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-monday-pro)

---

## 📜 Version history

## Changelog

- **`0.0.8`** – Added board: delete, duplicate; adjusted Create board operation
- **`0.0.7`** – Added docs operations: get, create, delete
- **`0.0.6`** – Complete refactor of descriptions, operations, and execution logic
- **`0.0.5`** – Fixed folder operations: get, create, delete
- **`0.0.4`** – Added folder operations: get many, update, delete, create
- **`0.0.3`** – Fix
- **`0.0.2`** – Added options to filter requested items and choose response data via JSON
- **`0.0.1`** – Initial release with extended Monday.com API support, Subitem creation, and create/delete/list Webhooks
