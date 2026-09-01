import {
  createRdhKey,
  GeneralColumnType,
  getUniqObjectKeys,
  ResultSetData,
  ResultSetDataBuilder,
  toDate,
} from '@l-v-yonsama/rdh';
import {
  GroupRepresentation,
  RealmRepresentation,
  RoleRepresentation,
  UserRepresentation,
  UserSessionRepresentation,
} from '../../types';

interface UserRowData
  extends Omit<UserRepresentation, 'createdTimestamp' | 'attributes'> {
  createdTimestamp: Date;
  attributes?: string;
  [key: string]: any;
}

// Pure RDH builders for KeycloakDriver#scan(): each takes data already fetched over HTTP (by KeycloakDriver's own get*() methods) and converts it to a ResultSetData, with no API/auth concerns of its own.

export const buildIamRealmResultSet = (
  realms: RealmRepresentation[],
): ResultSetData => {
  const rdb = new ResultSetDataBuilder([
    createRdhKey({ name: 'id', type: GeneralColumnType.UUID }),
    createRdhKey({ name: 'displayName', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'realm', type: GeneralColumnType.TEXT }),
    createRdhKey({
      name: 'notBefore',
      type: GeneralColumnType.INTEGER,
    }),
    createRdhKey({
      name: 'duplicateEmailsAllowed',
      type: GeneralColumnType.BOOLEAN,
    }),
    createRdhKey({
      name: 'editUsernameAllowed',
      type: GeneralColumnType.BOOLEAN,
    }),
    createRdhKey({ name: 'enabled', type: GeneralColumnType.BOOLEAN }),
    createRdhKey({
      name: 'keycloakVersion',
      type: GeneralColumnType.TEXT,
    }),
    createRdhKey({
      name: 'rememberMe',
      type: GeneralColumnType.BOOLEAN,
    }),
    createRdhKey({
      name: 'verifyEmail',
      type: GeneralColumnType.BOOLEAN,
    }),
  ]);
  realms.forEach((realm) => {
    rdb.addRow({
      id: realm.id,
      displayName: realm.displayName,
      realm: realm.realm,
      notBefore: realm.notBefore,
      duplicateEmailsAllowed: realm.duplicateEmailsAllowed,
      editUsernameAllowed: realm.editUsernameAllowed,
      enabled: realm.enabled,
      keycloakVersion: realm.keycloakVersion,
      rememberMe: realm.rememberMe,
      verifyEmail: realm.verifyEmail,
    });
  });
  rdb.updateMeta({ compareKeys: [{ kind: 'primary', names: ['id'] }] });

  return rdb.build();
};

export const buildIamUserResultSet = (
  users: UserRepresentation[],
  jsonExpansion: boolean | undefined,
): ResultSetData => {
  let innerAttrNames: string[] = [];
  const keys = [
    createRdhKey({ name: 'id', type: GeneralColumnType.UUID }),
    createRdhKey({
      name: 'createdTimestamp',
      type: GeneralColumnType.TIMESTAMP,
    }),
    createRdhKey({ name: 'username', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'firstName', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'lastName', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'email', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'enabled', type: GeneralColumnType.BOOLEAN }),
    createRdhKey({
      name: 'emailVerified',
      type: GeneralColumnType.BOOLEAN,
    }),
    createRdhKey({
      name: 'notBefore',
      type: GeneralColumnType.INTEGER,
    }),
    createRdhKey({
      name: 'requiredActions',
      type: GeneralColumnType.ARRAY,
    }),
  ];

  if (jsonExpansion) {
    innerAttrNames = getUniqObjectKeys(users.map((it) => it.attributes));
    innerAttrNames.forEach((it) => {
      keys.push(
        createRdhKey({
          name: `attributes::${it}`,
          type: GeneralColumnType.JSON,
        }),
      );
    });
  } else {
    keys.push(
      createRdhKey({
        name: 'attributes',
        type: GeneralColumnType.JSON,
      }),
    );
  }

  const rdb = new ResultSetDataBuilder(keys);

  users.forEach((user) => {
    const rowData: UserRowData = {
      id: user.id,
      createdTimestamp: toDate(user.createdTimestamp),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      enabled: user.enabled,
      emailVerified: user.emailVerified,
      notBefore: user.notBefore,
      requiredActions: user.requiredActions,
    };
    if (jsonExpansion) {
      innerAttrNames.forEach((it) => {
        rowData[`attributes::${it}`] = JSON.stringify(user.attributes?.[it]);
      });
    } else {
      rowData['attributes'] = JSON.stringify(user.attributes);
    }
    rdb.addRow(rowData);
  });
  rdb.updateMeta({ compareKeys: [{ kind: 'primary', names: ['id'] }] });

  return rdb.build();
};

export const buildIamRoleResultSet = (
  roles: RoleRepresentation[],
): ResultSetData => {
  const rdb = new ResultSetDataBuilder([
    createRdhKey({ name: 'id', type: GeneralColumnType.UUID }),
    createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'description', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'composite', type: GeneralColumnType.BOOLEAN }),
    createRdhKey({ name: 'clientRole', type: GeneralColumnType.BOOLEAN }),
    createRdhKey({ name: 'containerId', type: GeneralColumnType.TEXT }),
  ]);
  roles.forEach((role) => {
    rdb.addRow({
      id: role.id,
      name: role.name,
      description: role.description,
      composite: role.composite,
      clientRole: role.clientRole,
      containerId: role.containerId,
    });
  });
  rdb.updateMeta({ compareKeys: [{ kind: 'primary', names: ['id'] }] });

  return rdb.build();
};

export const buildIamGroupResultSet = (
  groups: GroupRepresentation[],
): ResultSetData => {
  const rdb = new ResultSetDataBuilder([
    createRdhKey({ name: 'id', type: GeneralColumnType.UUID }),
    createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'path', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'subGroupNames', type: GeneralColumnType.TEXT }),
  ]);
  groups.forEach((group) => {
    rdb.addRow({
      id: group.id,
      name: group.name,
      path: group.path,
      subGroupNames:
        group.subGroups?.map((it) => it.name ?? '')?.join(',') ?? '',
    });
  });
  rdb.updateMeta({ compareKeys: [{ kind: 'primary', names: ['id'] }] });

  return rdb.build();
};

export const buildIamSessionResultSet = (
  sessions: UserSessionRepresentation[],
): ResultSetData => {
  const rdb = new ResultSetDataBuilder([
    createRdhKey({ name: 'id', type: GeneralColumnType.UUID }),
    createRdhKey({ name: 'userId', type: GeneralColumnType.UUID }),
    createRdhKey({ name: 'username', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'start', type: GeneralColumnType.TIMESTAMP }),
    createRdhKey({
      name: 'lastAccess',
      type: GeneralColumnType.TIMESTAMP,
    }),
    createRdhKey({ name: 'ipAddress', type: GeneralColumnType.TEXT }),
    createRdhKey({ name: 'clients', type: GeneralColumnType.JSON }),
  ]);
  sessions.forEach((session) => {
    rdb.addRow({
      id: session.id,
      userId: session.userId,
      username: session.username,
      start: toDate(session.start),
      lastAccess: toDate(session.lastAccess),
      ipAddress: session.ipAddress,
      clients: session.clients,
    });
  });
  rdb.updateMeta({ compareKeys: [{ kind: 'primary', names: ['id'] }] });

  return rdb.build();
};

// Not part of KeycloakDriver's public API; exported so KeycloakDriver.ts (updateGroup) can reuse it without duplicating it.
export const normalizeAttribute = (
  attr: Record<string, any> | undefined,
): Record<string, any[]> | undefined => {
  if (attr === undefined) {
    return undefined;
  }
  const record: Record<string, any[]> = {};
  Object.keys(attr).forEach((key) => {
    const v = attr[key];
    if (Array.isArray(v)) {
      record[key] = v;
    } else {
      record[key] = [v];
    }
  });

  return record;
};
