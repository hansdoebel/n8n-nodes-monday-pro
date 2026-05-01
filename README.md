<h1 align="center">
  <br>
  n8n-nodes-monday-pro
  <br>
</h1>

<p align="center">
	<img alt="NPM Version" src="https://img.shields.io/npm/v/n8n-nodes-monday-pro">
	<img alt="GitHub License" src="https://img.shields.io/github/license/hansdoebel/n8n-nodes-monday-pro">
	<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/n8n-nodes-monday-pro">
	<img alt="NPM Last Update" src="https://img.shields.io/npm/last-update/n8n-nodes-monday-pro">
	<img alt="Static Badge" src="https://img.shields.io/badge/n8n-2.18.1-EA4B71?logo=n8n">
</p>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#credentials">Credentials</a> |
  <a href="#resources">Resources</a> |
  <a href="#development">Development</a> |
  <a href="#license">License</a>
</p>

---

A custom n8n community node providing an extended integration with [Monday.com](https://monday.com), including several additional features not covered by the official node.

## Installation

1. Create a new workflow or open an existing one
2. Open the nodes panel by selecting **+** or pressing **N**
3. Search for **Monday Pro**
4. Select **Install** to install the node for your instance

## Credentials

This node supports two authentication methods with the Monday.com API.

1. **OAuth2**: Use the built-in OAuth2 flow to connect your Monday.com account
2. **API Token**: Provide a personal API token from your Monday.com account
   1. Log in to [Monday.com](https://monday.com)
   2. Navigate to **Avatar (bottom-left)** > **Administration** > **Connections** > **API**
   3. Copy your **API Token**
   4. In n8n, create a **Monday Pro API** credential and paste the token

## Resources

<details>
<summary><strong>Board</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Archive | Archive a board |
| Create | Create a new board |
| Delete | Delete a board |
| Duplicate | Duplicate a board |
| Get | Get a board |
| Get Many | Get many boards |
| Set Permission | Set a board's default role/permissions |
| Update | Update a board |
| Update Hierarchy | Update a board's position, workspace, or product |

</details>

<details>
<summary><strong>Board Column</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new column |
| Get Many | Get many columns |

</details>

<details>
<summary><strong>Board Group</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a group in a board |
| Delete | Delete a group in a board |
| Get Many | Get list of groups in a board |

</details>

<details>
<summary><strong>Board Item</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Add Update | Add an update to an item |
| Change Column Value | Change a column value for a board item |
| Change Multiple Column Values | Change multiple column values for a board item |
| Create | Create an item in a board's group |
| Delete | Delete an item |
| Get | Get an item |
| Get By Column Value | Get items by column value |
| Get Filtered | Get items using items_page filters |
| Get Many | Get many items |
| Move | Move item to group |

</details>

<details>
<summary><strong>Subitem</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a subitem under a parent item |

</details>

<details>
<summary><strong>Webhook</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a webhook for a board |
| Create Many | Create many webhooks for a board |
| Delete | Delete an existing webhook by its ID |
| Get Many | List webhooks created on a board |

</details>

<details>
<summary><strong>Folder</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a folder inside a workspace |
| Delete | Delete a folder |
| Get Many | List folders in one or more workspaces |
| Update | Update an existing folder |

</details>

<details>
<summary><strong>Doc</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new doc |
| Delete | Delete a doc by ID |
| Get | Retrieve a doc by ID |

</details>

## Development

```bash
git clone https://github.com/hansdoebel/n8n-nodes-monday-pro.git
cd n8n-nodes-monday-pro
bun install
bun run build
bun run lint
```

## License

[MIT](LICENSE.md)

<p align="center">
  <a href="https://github.com/hansdoebel/n8n-nodes-monday-pro">GitHub</a> |
  <a href="https://github.com/hansdoebel/n8n-nodes-monday-pro/issues">Issues</a> |
  <a href="https://developer.monday.com/api-reference">Monday.com API Docs</a>
</p>
