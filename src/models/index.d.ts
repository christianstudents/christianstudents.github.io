import { ModelInit, MutableModel, __modelMeta__, OptionallyManagedIdentifier, CustomIdentifier, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum ChallengeIcons {
  READ = "READ",
  SHARE = "SHARE",
  VERSE = "VERSE"
}



type EagerChallenge = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Challenge, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly auto: boolean;
  readonly autoDailyBread?: boolean | null;
  readonly autoComments?: boolean | null;
  readonly description: string;
  readonly title: string;
  readonly icon: ChallengeIcons | keyof typeof ChallengeIcons;
  readonly weeks?: (ChallengeWeeks | null)[] | null;
  readonly completers?: (Completer | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChallenge = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Challenge, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly auto: boolean;
  readonly autoDailyBread?: boolean | null;
  readonly autoComments?: boolean | null;
  readonly description: string;
  readonly title: string;
  readonly icon: ChallengeIcons | keyof typeof ChallengeIcons;
  readonly weeks: AsyncCollection<ChallengeWeeks>;
  readonly completers: AsyncCollection<Completer>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Challenge = LazyLoading extends LazyLoadingDisabled ? EagerChallenge : LazyChallenge

export declare const Challenge: (new (init: ModelInit<Challenge>) => Challenge) & {
  copyOf(source: Challenge, mutator: (draft: MutableModel<Challenge>) => MutableModel<Challenge> | void): Challenge;
}

type EagerWeek = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Week, 'monday'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly monday: string;
  readonly challenges?: (ChallengeWeeks | null)[] | null;
  readonly completers?: (Completer | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWeek = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Week, 'monday'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly monday: string;
  readonly challenges: AsyncCollection<ChallengeWeeks>;
  readonly completers: AsyncCollection<Completer>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Week = LazyLoading extends LazyLoadingDisabled ? EagerWeek : LazyWeek

export declare const Week: (new (init: ModelInit<Week>) => Week) & {
  copyOf(source: Week, mutator: (draft: MutableModel<Week>) => MutableModel<Week> | void): Week;
}

type EagerCompleter = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Completer, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly week?: Week | null;
  readonly challenge?: Challenge | null;
  readonly user?: User | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly challengeCompletersId?: string | null;
  readonly weekCompletersMonday?: string | null;
  readonly userCompletedChallengesUsername?: string | null;
}

type LazyCompleter = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Completer, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly week: AsyncItem<Week | undefined>;
  readonly challenge: AsyncItem<Challenge | undefined>;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly challengeCompletersId?: string | null;
  readonly weekCompletersMonday?: string | null;
  readonly userCompletedChallengesUsername?: string | null;
}

export declare type Completer = LazyLoading extends LazyLoadingDisabled ? EagerCompleter : LazyCompleter

export declare const Completer: (new (init: ModelInit<Completer>) => Completer) & {
  copyOf(source: Completer, mutator: (draft: MutableModel<Completer>) => MutableModel<Completer> | void): Completer;
}

type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<User, 'username'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly username: string;
  readonly name: string;
  readonly anonymous: boolean;
  readonly dailyBreadNotificationTime?: string | null;
  readonly dailyBreadNotifications?: boolean | null;
  readonly dailyBreads?: (DailyBreadUser | null)[] | null;
  readonly morningRevival?: (MorningRevivalUser | null)[] | null;
  readonly events?: (EventsUser | null)[] | null;
  readonly completedChallenges?: (Completer | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<User, 'username'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly username: string;
  readonly name: string;
  readonly anonymous: boolean;
  readonly dailyBreadNotificationTime?: string | null;
  readonly dailyBreadNotifications?: boolean | null;
  readonly dailyBreads: AsyncCollection<DailyBreadUser>;
  readonly morningRevival: AsyncCollection<MorningRevivalUser>;
  readonly events: AsyncCollection<EventsUser>;
  readonly completedChallenges: AsyncCollection<Completer>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerComments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Comments, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly text: string;
  readonly datetime: string;
  readonly username: string;
  readonly dailyBread?: string | null;
  readonly morningRevival?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyComments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Comments, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly text: string;
  readonly datetime: string;
  readonly username: string;
  readonly dailyBread?: string | null;
  readonly morningRevival?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Comments = LazyLoading extends LazyLoadingDisabled ? EagerComments : LazyComments

export declare const Comments: (new (init: ModelInit<Comments>) => Comments) & {
  copyOf(source: Comments, mutator: (draft: MutableModel<Comments>) => MutableModel<Comments> | void): Comments;
}

type EagerDailyBread = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<DailyBread, 'date'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly date: string;
  readonly bookName: string;
  readonly chapterIdx: string;
  readonly comments?: (Comments | null)[] | null;
  readonly users?: (DailyBreadUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDailyBread = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<DailyBread, 'date'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly date: string;
  readonly bookName: string;
  readonly chapterIdx: string;
  readonly comments: AsyncCollection<Comments>;
  readonly users: AsyncCollection<DailyBreadUser>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DailyBread = LazyLoading extends LazyLoadingDisabled ? EagerDailyBread : LazyDailyBread

export declare const DailyBread: (new (init: ModelInit<DailyBread>) => DailyBread) & {
  copyOf(source: DailyBread, mutator: (draft: MutableModel<DailyBread>) => MutableModel<DailyBread> | void): DailyBread;
}

type EagerEvent = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Event, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly startDateTime: string;
  readonly endDateTime: string;
  readonly location: string;
  readonly topic?: string | null;
  readonly title: string;
  readonly handout?: string | null;
  readonly users?: (EventsUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEvent = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Event, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly startDateTime: string;
  readonly endDateTime: string;
  readonly location: string;
  readonly topic?: string | null;
  readonly title: string;
  readonly handout?: string | null;
  readonly users: AsyncCollection<EventsUser>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Event = LazyLoading extends LazyLoadingDisabled ? EagerEvent : LazyEvent

export declare const Event: (new (init: ModelInit<Event>) => Event) & {
  copyOf(source: Event, mutator: (draft: MutableModel<Event>) => MutableModel<Event> | void): Event;
}

type EagerMorningRevival = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<MorningRevival, 'date'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly date: string;
  readonly verses?: (string | null)[] | null;
  readonly excerpts?: string | null;
  readonly instruction?: string | null;
  readonly comments?: (Comments | null)[] | null;
  readonly users?: (MorningRevivalUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMorningRevival = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<MorningRevival, 'date'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly date: string;
  readonly verses?: (string | null)[] | null;
  readonly excerpts?: string | null;
  readonly instruction?: string | null;
  readonly comments: AsyncCollection<Comments>;
  readonly users: AsyncCollection<MorningRevivalUser>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MorningRevival = LazyLoading extends LazyLoadingDisabled ? EagerMorningRevival : LazyMorningRevival

export declare const MorningRevival: (new (init: ModelInit<MorningRevival>) => MorningRevival) & {
  copyOf(source: MorningRevival, mutator: (draft: MutableModel<MorningRevival>) => MutableModel<MorningRevival> | void): MorningRevival;
}

type EagerChallengeWeeks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChallengeWeeks, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly challengeId?: string | null;
  readonly weekMonday?: string | null;
  readonly challenge: Challenge;
  readonly week: Week;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChallengeWeeks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChallengeWeeks, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly challengeId?: string | null;
  readonly weekMonday?: string | null;
  readonly challenge: AsyncItem<Challenge>;
  readonly week: AsyncItem<Week>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChallengeWeeks = LazyLoading extends LazyLoadingDisabled ? EagerChallengeWeeks : LazyChallengeWeeks

export declare const ChallengeWeeks: (new (init: ModelInit<ChallengeWeeks>) => ChallengeWeeks) & {
  copyOf(source: ChallengeWeeks, mutator: (draft: MutableModel<ChallengeWeeks>) => MutableModel<ChallengeWeeks> | void): ChallengeWeeks;
}

type EagerDailyBreadUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DailyBreadUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly dailyBreadDate?: string | null;
  readonly user: User;
  readonly dailyBread: DailyBread;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDailyBreadUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DailyBreadUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly dailyBreadDate?: string | null;
  readonly user: AsyncItem<User>;
  readonly dailyBread: AsyncItem<DailyBread>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DailyBreadUser = LazyLoading extends LazyLoadingDisabled ? EagerDailyBreadUser : LazyDailyBreadUser

export declare const DailyBreadUser: (new (init: ModelInit<DailyBreadUser>) => DailyBreadUser) & {
  copyOf(source: DailyBreadUser, mutator: (draft: MutableModel<DailyBreadUser>) => MutableModel<DailyBreadUser> | void): DailyBreadUser;
}

type EagerMorningRevivalUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MorningRevivalUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly morningRevivalDate?: string | null;
  readonly user: User;
  readonly morningRevival: MorningRevival;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMorningRevivalUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MorningRevivalUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly morningRevivalDate?: string | null;
  readonly user: AsyncItem<User>;
  readonly morningRevival: AsyncItem<MorningRevival>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MorningRevivalUser = LazyLoading extends LazyLoadingDisabled ? EagerMorningRevivalUser : LazyMorningRevivalUser

export declare const MorningRevivalUser: (new (init: ModelInit<MorningRevivalUser>) => MorningRevivalUser) & {
  copyOf(source: MorningRevivalUser, mutator: (draft: MutableModel<MorningRevivalUser>) => MutableModel<MorningRevivalUser> | void): MorningRevivalUser;
}

type EagerEventsUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<EventsUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly eventId?: string | null;
  readonly user: User;
  readonly event: Event;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEventsUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<EventsUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userUsername?: string | null;
  readonly eventId?: string | null;
  readonly user: AsyncItem<User>;
  readonly event: AsyncItem<Event>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type EventsUser = LazyLoading extends LazyLoadingDisabled ? EagerEventsUser : LazyEventsUser

export declare const EventsUser: (new (init: ModelInit<EventsUser>) => EventsUser) & {
  copyOf(source: EventsUser, mutator: (draft: MutableModel<EventsUser>) => MutableModel<EventsUser> | void): EventsUser;
}