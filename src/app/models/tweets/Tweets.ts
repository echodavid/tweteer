export enum EReaction {
  REACTION_LIKE = 'REACTION_LIKE',
  REACTION_LOVE = 'REACTION_LOVE',
  REACTION_HATE = 'REACTION_HATE',
  REACTION_SAD = 'REACTION_SAD',
  REACTION_ANGRY = 'REACTION_ANGRY',
}

export type ReactionCounts = {
  [key: string]: number | undefined;
};
export interface Tweet {
  id: number;
  tweet: string;
  postedBy: string;
  reactionCounts: ReactionCounts;
  userReaction: EReaction | null;
}
