import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'bot';
  content: string;
  time: string;
  graph?: {
    x: string[] | number[];
    x_label: string;
    y: string[] | number[];
    y_label: string;
  } | null;
}

export interface IChatSession {
  heading: string;
  createdAt: Date;
  messages: IChatMessage[];
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  sessions: IChatSession[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  time: { type: String, required: true },
  graph: {
    x: [String],
    x_label: String,
    y: [Schema.Types.Mixed],
    y_label: String
  }
});

const ChatSessionSchema = new Schema<IChatSession>({
  heading: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  messages: [ChatMessageSchema]
});

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  sessions: [ChatSessionSchema],
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });

export default mongoose.models.User_crunchbot || mongoose.model<IUser>('User_crunchbot', UserSchema); 