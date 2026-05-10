import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  photo: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'GK';
  number: number;
  basePrice: number;
  soldPrice?: number;
  team?: mongoose.Types.ObjectId;
  status: 'available' | 'sold' | 'unsold';
}

const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  position: { type: String, enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'GK'], required: true },
  number: { type: Number, required: true, unique: true, min: 1, max: 80 },
  basePrice: { type: Number, default: 500 },
  soldPrice: { type: Number },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  status: { type: String, enum: ['available', 'sold', 'unsold'], default: 'available' },
}, { timestamps: true });

export default (mongoose.models.Player as mongoose.Model<IPlayer>) || mongoose.model<IPlayer>('Player', PlayerSchema);
