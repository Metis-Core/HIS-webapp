export enum MessageEndpointEnum {
  BASE = '/messages',
  CONVERSATIONS = '/messages/conversations',
  UNREAD = '/messages/unread',
  CONTACTS = '/messages/contacts',
  WITH = '/messages/with',
  TEAMS = '/messages/teams',
}

/** A role-based mailbox: whoever is on duty in the team reads the message. */
export enum MessageTeamEnum {
  RECEPTION = 'reception',
  NURSES = 'nurses',
  DOCTORS = 'doctors',
  LABORATORY = 'laboratory',
  PHARMACY = 'pharmacy',
  ACCOUNTS = 'accounts',
  ADMINISTRATION = 'administration',
}

export const MESSAGE_TEAM_LABEL: Record<MessageTeamEnum, string> = {
  [MessageTeamEnum.RECEPTION]: 'Reception',
  [MessageTeamEnum.NURSES]: 'Nurses',
  [MessageTeamEnum.DOCTORS]: 'Doctors',
  [MessageTeamEnum.LABORATORY]: 'Laboratory',
  [MessageTeamEnum.PHARMACY]: 'Pharmacy',
  [MessageTeamEnum.ACCOUNTS]: 'Accounts',
  [MessageTeamEnum.ADMINISTRATION]: 'Administration',
};

export const isMessageTeam = (value: string | null): value is MessageTeamEnum =>
  Object.values(MessageTeamEnum).includes(value as MessageTeamEnum);
