import mongoose, { Schema, Document } from 'mongoose';

export interface ICarouselItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  link?: string;
}

export interface IFeaturedVideo {
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
}

export interface ISiteSetting extends Document {
  carouselItems: ICarouselItem[];
  featuredVideos: IFeaturedVideo[];
  featuredMembers: string[]; // User IDs
  contactEmail?: string;
  contactAddress?: string;
  aboutContent?: string; // New field for About page content
  updatedAt: Date;
}

const CarouselItemSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  link: { type: String }
});

const FeaturedVideoSchema = new Schema({
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String }
});

const SiteSettingSchema: Schema = new Schema({
  carouselItems: [CarouselItemSchema],
  featuredVideos: [FeaturedVideoSchema],
  featuredMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  contactEmail: { type: String },
  contactAddress: { type: String },
  aboutContent: { type: String } // New field schema
}, { timestamps: true });

export const SiteSetting = mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);
