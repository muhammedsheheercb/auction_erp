import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  logo?: string;
  manager1: string;
  manager2: string;
  totalBudget: number;
  remainingBudget: number;
  players: mongoose.Types.ObjectId[];
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  manager1: { type: String, required: true },
  manager2: { type: String, required: true },
  totalBudget: { type: Number, default: 20000 },
  remainingBudget: { type: Number, default: 20000 },
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
