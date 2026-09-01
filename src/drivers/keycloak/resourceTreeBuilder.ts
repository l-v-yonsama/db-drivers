import { IamClient, IamGroup, IamRealm } from '../../resource';
import {
  ClientRepresentation,
  GroupRepresentation,
  RealmRepresentation,
} from '../../types';


export const buildIamRealmResource = (
  realm: RealmRepresentation,
  isDefault: boolean,
): IamRealm => {
  const realmRes = new IamRealm(realm.realm);
  if (realm.id) {
    (realmRes as any)['id'] = realm.id;
  }
  realmRes.isDefault = isDefault;
  return realmRes;
};

export const buildIamGroupResource = (group: GroupRepresentation): IamGroup => {
  const groupRes = new IamGroup(group.name);
  (groupRes as any)['id'] = group.id;
  groupRes.comment = group.path;
  return groupRes;
};

export const buildIamClientResource = (
  client: ClientRepresentation,
): IamClient => {
  const {
    name,
    id,
    clientId,
    protocol,
    baseUrl,
    standardFlowEnabled,
    implicitFlowEnabled,
    directAccessGrantsEnabled,
    ...params
  } = client;
  const clientRes = new IamClient(name);
  clientRes.clientId = clientId;
  clientRes.protocol = protocol;
  clientRes.baseUrl = baseUrl;
  clientRes.standardFlowEnabled = standardFlowEnabled;
  clientRes.implicitFlowEnabled = implicitFlowEnabled;
  clientRes.directAccessGrantsEnabled = directAccessGrantsEnabled;
  (clientRes as any)['id'] = id;
  clientRes.comment = clientId;
  clientRes.meta = params;
  return clientRes;
};
