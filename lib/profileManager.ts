export interface UserProfile {
  name: string;
  age: number;
  email: string;
  gender: string;
  interests: string[];
  postcode: string;
  livingSituation: string;
  occupation: string;
  mood?: string;
  preferences?: {
    groupSize?: 'small' | 'medium' | 'large';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    budget?: 'free' | 'low' | 'medium' | 'high';
    activityLevel?: 'relaxed' | 'moderate' | 'active';
  };
  savedAt?: string;
}

class ProfileManager {
  private storageKey = 'social-connect-profiles';
  private currentProfileKey = 'social-connect-current-profile';

  // Save profile to localStorage
  saveProfile(profile: UserProfile): void {
    try {
      const profiles = this.getAllProfiles();
      
      // Check if profile with same email already exists
      const existingIndex = profiles.findIndex(p => p.email === profile.email);
      
      if (existingIndex >= 0) {
        // Update existing profile
        profiles[existingIndex] = { ...profile, savedAt: new Date().toISOString() };
      } else {
        // Add new profile
        profiles.push({ ...profile, savedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  // Get all saved profiles
  getAllProfiles(): UserProfile[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  // Get profile by email
  getProfileByEmail(email: string): UserProfile | null {
    try {
      const profiles = this.getAllProfiles();
      return profiles.find(p => p.email === email) || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Delete profile
  deleteProfile(email: string): void {
    try {
      const profiles = this.getAllProfiles();
      const filtered = profiles.filter(p => p.email !== email);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  }

  // Set current profile (for quick access)
  setCurrentProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.currentProfileKey, JSON.stringify(profile));
    } catch (error) {
      console.error('Error setting current profile:', error);
    }
  }

  // Get current profile
  getCurrentProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.currentProfileKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current profile:', error);
      return null;
    }
  }

  // Clear current profile
  clearCurrentProfile(): void {
    try {
      localStorage.removeItem(this.currentProfileKey);
    } catch (error) {
      console.error('Error clearing current profile:', error);
    }
  }
}

export const profileManager = new ProfileManager();
