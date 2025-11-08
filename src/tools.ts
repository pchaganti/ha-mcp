import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  // File Operations
  {
    name: 'ha_read_file',
    description: 'Read a file from Home Assistant configuration directory. Use this to read configuration.yaml, automations.yaml, scripts.yaml, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to /config (e.g., "configuration.yaml", "automations.yaml", "scripts/my_script.yaml")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'ha_write_file',
    description: 'Write content to a file in Home Assistant configuration directory. Always commit changes after writing files.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to /config',
        },
        content: {
          type: 'string',
          description: 'Content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'ha_list_files',
    description: 'List all files and directories in Home Assistant configuration directory',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Directory path relative to /config (default: "/")',
        },
      },
    },
  },
  {
    name: 'ha_delete_file',
    description: 'Delete a file from Home Assistant configuration directory. Use with caution!',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to delete',
        },
      },
      required: ['path'],
    },
  },

  // Entity Operations
  {
    name: 'ha_list_entities',
    description: 'List all entities in Home Assistant, optionally filtered by domain (e.g., light, climate, sensor)',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Optional domain filter (e.g., "light", "climate", "sensor")',
        },
      },
    },
  },
  {
    name: 'ha_get_entity_state',
    description: 'Get current state and attributes of a specific entity',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: {
          type: 'string',
          description: 'Entity ID (e.g., "light.living_room", "climate.bedroom")',
        },
      },
      required: ['entity_id'],
    },
  },

  // Helper Operations
  {
    name: 'ha_create_helper',
    description: 'Create a Home Assistant helper (input_boolean, input_number, input_text, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Helper type (input_boolean, input_number, input_text, input_select, input_datetime)',
        },
        config: {
          type: 'object',
          description: 'Helper configuration object',
        },
      },
      required: ['type', 'config'],
    },
  },
  {
    name: 'ha_list_helpers',
    description: 'List all configured helpers in Home Assistant',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Automation Operations
  {
    name: 'ha_create_automation',
    description: 'Create a new automation in Home Assistant. Always validate the config format first.',
    inputSchema: {
      type: 'object',
      properties: {
        config: {
          type: 'object',
          description: 'Automation configuration (id, alias, trigger, condition, action)',
        },
      },
      required: ['config'],
    },
  },
  {
    name: 'ha_list_automations',
    description: 'List all automations configured in Home Assistant',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Script Operations
  {
    name: 'ha_create_script',
    description: 'Create a new script in Home Assistant',
    inputSchema: {
      type: 'object',
      properties: {
        config: {
          type: 'object',
          description: 'Script configuration object',
        },
      },
      required: ['config'],
    },
  },
  {
    name: 'ha_list_scripts',
    description: 'List all scripts configured in Home Assistant',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Git/Backup Operations
  {
    name: 'ha_git_commit',
    description: 'Commit current Home Assistant configuration to Git. ALWAYS use this after making changes to configuration files.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message describing the changes',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'ha_git_history',
    description: 'Get Git commit history for Home Assistant configuration',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of commits to retrieve (default: 20)',
        },
      },
    },
  },
  {
    name: 'ha_git_rollback',
    description: 'Rollback Home Assistant configuration to a specific Git commit. Use with caution!',
    inputSchema: {
      type: 'object',
      properties: {
        commit_hash: {
          type: 'string',
          description: 'Git commit hash to rollback to',
        },
      },
      required: ['commit_hash'],
    },
  },

  // System Operations
  {
    name: 'ha_check_config',
    description: 'Validate Home Assistant configuration before reloading. ALWAYS use this before reloading config.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ha_reload_config',
    description: 'Reload Home Assistant configuration without full restart. Use after making changes and checking config.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ha_get_logs',
    description: 'Get recent HA Cursor Agent logs to troubleshoot issues and see what commands are being executed',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of log entries to retrieve (default: 100)',
        },
        level: {
          type: 'string',
          description: 'Filter by log level: DEBUG, INFO, WARNING, ERROR (optional)',
          enum: ['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        },
      },
    },
  },
];


