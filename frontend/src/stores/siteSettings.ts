import { defineStore } from 'pinia';
import request from '../utils/request';

export interface CarouselItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  link?: string;
  _id?: string;
}

export interface FeaturedVideo {
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  _id?: string;
}

export const useSiteSettingsStore = defineStore('siteSettings', {
  state: () => ({
    carouselItems: [] as CarouselItem[],
    featuredVideos: [] as FeaturedVideo[],
    featuredMembers: [] as string[], // User IDs
    contactEmail: '',
    contactAddress: '',
    aboutContent: '',
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const data: any = await request.get('/settings');
        if (data) {
          this.carouselItems = data.carouselItems || [];
          this.featuredVideos = data.featuredVideos || [];
          this.featuredMembers = data.featuredMembers || [];
          this.contactEmail = data.contactEmail || '';
          this.contactAddress = data.contactAddress || '';
          this.aboutContent = data.aboutContent || '';
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch settings';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async updateSettings(data: any) {
      this.loading = true;
      try {
        const updated: any = await request.put('/settings', data);
        if (updated) {
          this.carouselItems = updated.carouselItems || [];
          this.featuredVideos = updated.featuredVideos || [];
          this.featuredMembers = updated.featuredMembers || [];
          this.contactEmail = updated.contactEmail || '';
          this.contactAddress = updated.contactAddress || '';
          this.aboutContent = updated.aboutContent || '';
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to update settings';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCarouselItems(items: CarouselItem[]) {
      return this.updateSettings({ carouselItems: items });
    },

    async uploadImage(file: File) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response: any = await request.post('/settings/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.imageUrl;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to upload image');
      }
    }
  }
});
