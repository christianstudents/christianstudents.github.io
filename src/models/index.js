// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const ChallengeIcons = {
  "READ": "READ",
  "SHARE": "SHARE",
  "VERSE": "VERSE"
};

const { Challenge, Week, Completer, User, Comments, DailyBread, Event, MorningRevival, ChallengeWeeks, DailyBreadUser, MorningRevivalUser, EventsUser } = initSchema(schema);

export {
  Challenge,
  Week,
  Completer,
  User,
  Comments,
  DailyBread,
  Event,
  MorningRevival,
  ChallengeWeeks,
  DailyBreadUser,
  MorningRevivalUser,
  EventsUser,
  ChallengeIcons
};