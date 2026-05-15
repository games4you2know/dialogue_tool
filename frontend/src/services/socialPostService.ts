import type { SocialPost } from '../types/index';
import API_BASE_URL from '../config/api';

export interface CreateSocialPostRequest {
  projectId: string;
  content: string;
  reportReason?: number | null;
}

export interface UpdateSocialPostRequest {
  content?: string;
  reportReason?: number | null;
}

export const socialPostService = {
  async getByProject(projectId: string): Promise<SocialPost[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/social-posts/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error fetching social posts: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching social posts:', error);
      throw error;
    }
  },

  async create(post: CreateSocialPostRequest): Promise<SocialPost> {
    try {
      const response = await fetch(`${API_BASE_URL}/social-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        throw new Error(`Error creating social post: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating social post:', error);
      throw error;
    }
  },

  async update(postId: string, post: UpdateSocialPostRequest): Promise<SocialPost> {
    try {
      const response = await fetch(`${API_BASE_URL}/social-posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        throw new Error(`Error updating social post: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error updating social post:', error);
      throw error;
    }
  },

  async delete(postId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/social-posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting social post: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting social post:', error);
      throw error;
    }
  },
};
