import {pull, groupBy} from 'lodash';

const PERMISSION_LEVELS = {
  read: 0,
  write: 1,
  admin: 2,
};

const PERMISSION_VALUES = {
  read: 'read',
  write: 'read-write',
  admin: 'admin',
};

const HUMAN_RESOURCE_NAMES = {
  project: 'Project',
  team: 'Team',
  release: 'Release',
  event: 'Event',
  org: 'Organization',
  member: 'Member',
};

const PROJECT_RELEASES = 'project:releases';

export default class ConsolidatedScopes {
  constructor(scopes) {
    this.scopes = scopes;
  }

  /**
   * Convert into a list of Permissions, grouped by resource.
   *
   * Example:
   *    {
   *      'Project': 'read',
   *      'Organization': 'read-write',
   *      'Team': 'no-access',
   *      ...
   *    }
   */
  toResourcePermissions() {
    let scopes = [...this.scopes];
    let permissions = this.defaultResourcePermissions;
    const {asResource, asPermission} = this;

    if (scopes.includes(PROJECT_RELEASES)) {
      permissions.Release = 'admin';
      pull(scopes, PROJECT_RELEASES);
    }

    this.topScopes(scopes).forEach(scope => {
      permissions[asResource(scope)] = asPermission(scope);
    });

    return permissions;
  }

  /**
   * Convert into a list of Permissions, grouped by access and including a
   * list of resources per access level.
   *
   * Example:
   *    {
   *      read:  ['Project', 'Organization'],
   *      write: ['Member'],
   *      admin: ['Release']
   *    }
   */
  toPermissions() {
    let scopes = [...this.scopes];
    let permissions = {read: [], write: [], admin: []};
    const {parsePermission, asResource} = this;

    if (scopes.includes(PROJECT_RELEASES)) {
      permissions.admin.push('Release');
      pull(scopes, PROJECT_RELEASES);
    }

    this.topScopes(scopes).forEach(scope => {
      permissions[parsePermission(scope)].push(asResource(scope));
    });

    return permissions;
  }

  /**
   * Return the most permissive scope for each resource.
   *
   * Example:
   *    Given the full list of scopes:
   *      ['project:read', 'project:write', 'team:read', 'team:write', 'team:admin']
   *
   *    this would return:
   *      ['project:write', 'team:admin']
   */
  topScopes(scopeList) {
    return Object.values(groupBy(scopeList, this.parseResource))
      .map(scopes => scopes.sort(this.compareScopes))
      .map(scopes => scopes.pop());
  }

  compareScopes = (a, b) => {
    return this.asPermissionLevel(a) - this.asPermissionLevel(b);
  };

  parseResource = scope => {
    return scope.split(':')[0];
  };

  parsePermission = scope => {
    return scope.split(':')[1];
  };

  asPermissionLevel = scope => {
    return PERMISSION_LEVELS[this.parsePermission(scope)];
  };

  asPermission = scope => {
    return PERMISSION_VALUES[this.parsePermission(scope)];
  };

  asResource = scope => {
    return HUMAN_RESOURCE_NAMES[this.parseResource(scope)];
  };

  get defaultResourcePermissions() {
    return {
      Project: 'no-access',
      Team: 'no-access',
      Release: 'no-access',
      Event: 'no-access',
      Organization: 'no-access',
      Member: 'no-access',
    };
  }
}
