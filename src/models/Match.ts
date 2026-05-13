import mongoose, { Schema, Document } from 'mongoose';

export type MatchStage = 'GROUP_A' | 'GROUP_B' | 'SEMI_1' | 'SEMI_2' | 'LOSERS_FINAL' | 'FINAL';
export type MatchStatus = 'upcoming' | 'completed';

export interface IGoalScorer {
  _id?: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  playerName: string;
  teamId: mongoose.Types.ObjectId;
  teamName: string;
  goals: number;
}

export interface IMatch extends Document {
  stage: MatchStage;
  matchNumber: number;
  homeTeam: mongoose.Types.ObjectId;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeam: mongoose.Types.ObjectId;
  awayTeamName: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  goalScorers: IGoalScorer[];
}

const GoalScorerSchema = new Schema({
  playerId:   { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  teamId:     { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  teamName:   { type: String, required: true },
  goals:      { type: Number, required: true, min: 1 },
});

const MatchSchema: Schema = new Schema({
  stage: {
    type: String,
    enum: ['GROUP_A', 'GROUP_B', 'SEMI_1', 'SEMI_2', 'LOSERS_FINAL', 'FINAL'],
    required: true,
  },
  matchNumber:   { type: Number, required: true },
  homeTeam:      { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  homeTeamName:  { type: String, required: true },
  homeTeamLogo:  { type: String, default: '' },
  awayTeam:      { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeamName:  { type: String, required: true },
  awayTeamLogo:  { type: String, default: '' },
  homeScore:     { type: Number, default: 0 },
  awayScore:     { type: Number, default: 0 },
  status:        { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  goalScorers:   [GoalScorerSchema],
}, { timestamps: true });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
