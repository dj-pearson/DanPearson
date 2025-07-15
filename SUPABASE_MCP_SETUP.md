# Supabase MCP Server Setup Guide

## What is Supabase MCP?

The Model Context Protocol (MCP) allows AI assistants like Cursor to directly interact with your Supabase database and services. This enables your AI assistant to:

- Create and manage Supabase projects
- Query databases using natural language
- Manage tables and schemas
- Deploy edge functions
- Handle authentication and other Supabase services

## Setup Steps

### 1. Create a Supabase Personal Access Token

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings** → **Access Tokens**
3. Click **Create New Token**
4. Give it a descriptive name like "Cursor MCP Server"
5. Copy the token (you won't be able to see it again)

### 2. Get Your Project Reference

1. In your Supabase Dashboard, select your project
2. Go to **Settings** → **General**
3. Copy the **Project ID** (this is your project reference)

### 3. Update the MCP Configuration

1. Open the file `.cursor/mcp.json` in your project
2. Replace `<YOUR_PERSONAL_ACCESS_TOKEN>` with your actual token
3. Replace `<YOUR_PROJECT_REF>` with your project ID

Example:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=your-actual-project-id"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-actual-token-here"
      }
    }
  }
}
```

### 4. Restart Cursor

1. Save the configuration file
2. Restart Cursor to apply the changes
3. Navigate to **Settings** → **MCP** in Cursor
4. You should see a green "Active" status for the Supabase server

## Configuration Options

### Read-Only Mode (Recommended)

The `--read-only` flag ensures that the AI can only read from your database, not modify it. This is enabled by default in the configuration above.

### Project Scoping (Recommended)

The `--project-ref` flag limits the MCP server to a specific Supabase project, which is safer than giving access to all your projects.

### Feature Groups

You can customize which tools are available by adding a `--features` flag:

```json
"--features=database,docs,development"
```

Available feature groups:

- `account` - Project management
- `database` - SQL queries and schema management
- `docs` - Supabase documentation search
- `debug` - Logs and debugging tools
- `development` - Project configuration and TypeScript types
- `functions` - Edge Functions management
- `branching` - Database branching (requires paid plan)
- `storage` - Storage bucket management

## Security Best Practices

1. **Use read-only mode** for development
2. **Scope to specific projects** rather than account-wide access
3. **Use development/staging projects** instead of production
4. **Regularly rotate access tokens**
5. **Review tool calls** before executing them

## Troubleshooting

### Server Not Starting

- Ensure Node.js is installed and in your PATH
- Check that the token and project reference are correct
- Restart Cursor after making configuration changes

### Permission Errors

- Verify your personal access token has the necessary permissions
- Check that the project reference is correct
- Ensure your Supabase account has access to the project

## Next Steps

Once configured, you can ask Cursor to:

- "Show me all tables in my database"
- "Create a new table for user profiles"
- "Generate TypeScript types for my database"
- "Help me write a query to find all users"
- "Deploy an edge function"

The AI will now have direct access to your Supabase project and can perform these operations on your behalf!
