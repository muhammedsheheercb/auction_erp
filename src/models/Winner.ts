import mongoose, { Schema, Document } from 'mongoose';

export interface IWinner extends Document {
  teamName: string;
  photo: string;
  season: string;
}

const WinnerSchema: Schema = new Schema({
  teamName: { type: String, required: true },
  photo: { type: String, required: true },
  season: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema);
