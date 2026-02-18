import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/settings';

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
        const response = await axios.get(API_URL);
        if (response.data) {
          this.carouselItems = response.data.carouselItems || [];
          this.featuredVideos = response.data.featuredVideos || [];
          this.featuredMembers = response.data.featuredMembers || [];
          this.contactEmail = response.data.contactEmail || '';
          this.contactAddress = response.data.contactAddress || '';
          this.aboutContent = response.data.aboutContent || '';
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
        const token = localStorage.getItem('token');
        const response = await axios.put(API_URL, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          this.carouselItems = response.data.carouselItems || [];
          this.featuredVideos = response.data.featuredVideos || [];
          this.featuredMembers = response.data.featuredMembers || [];
          this.contactEmail = response.data.contactEmail || '';
          this.contactAddress = response.data.contactAddress || '';
          this.aboutContent = response.data.aboutContent || '';
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
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data.imageUrl;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to upload image');
      }
    }
  }
});