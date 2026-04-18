export interface VictimProfile {
  email: string;
  name: string;
  mood: string;
  postcode: string;
  interests: string[];
  signedUpAt: string;
  lookingFor?: string;
}

class VictimsTracker {
  private storageKey = 'social-connect-victims';
  private nearbyUsersKey = 'social-connect-nearby-users';

  // Save victim profile
  saveVictim(profile: VictimProfile): void {
    try {
      const victims = this.getAllVictims();
      
      // Check if profile with same email already exists
      const existingIndex = victims.findIndex(v => v.email === profile.email);
      
      if (existingIndex >= 0) {
        // Update existing profile
        victims[existingIndex] = { ...profile, signedUpAt: new Date().toISOString() };
      } else {
        // Add new profile
        victims.push({ ...profile, signedUpAt: new Date().toISOString() });
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(victims));
    } catch (error) {
      console.error('Error saving victim profile:', error);
    }
  }

  // Get all victim profiles
  getAllVictims(): VictimProfile[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting victims:', error);
      return [];
    }
  }

  // Get victims by postcode (for nearby users)
  getVictimsByPostcode(postcode: string): VictimProfile[] {
    try {
      const victims = this.getAllVictims();
      const userArea = postcode.substring(0, 3).toLowerCase();
      
      return victims.filter(v => {
        const victimArea = v.postcode.substring(0, 3).toLowerCase();
        return victimArea === userArea;
      });
    } catch (error) {
      console.error('Error getting victims by postcode:', error);
      return [];
    }
  }

  // Get victims by mood
  getVictimsByMood(mood: string): VictimProfile[] {
    try {
      const victims = this.getAllVictims();
      return victims.filter(v => v.mood.toLowerCase() === mood.toLowerCase());
    } catch (error) {
      console.error('Error getting victims by mood:', error);
      return [];
    }
  }

  // Update victim's looking for status
  updateLookingFor(email: string, lookingFor: string): void {
    try {
      const victims = this.getAllVictims();
      const index = victims.findIndex(v => v.email === email);
      
      if (index >= 0) {
        victims[index].lookingFor = lookingFor;
        localStorage.setItem(this.storageKey, JSON.stringify(victims));
      }
    } catch (error) {
      console.error('Error updating looking for:', error);
    }
  }

  // Get nearby users (simulated for demo)
  getNearbyUsers(postcode: string, currentMood: string): VictimProfile[] {
    try {
      const victims = this.getVictimsByPostcode(postcode);
      
      // Filter by compatible moods
      const moodCompatibility: { [key: string]: string[] } = {
        'happy': ['relaxed', 'social', 'curious'],
        'relaxed': ['relaxed', 'social', 'curious'],
        'energetic': ['social', 'energetic', 'adventurous'],
        'social': ['social', 'happy', 'energetic'],
        'curious': ['curious', 'relaxed', 'social'],
        'adventurous': ['adventurous', 'energetic', 'happy'],
        'anxious': ['relaxed', 'curious', 'wellness'],
        'lonely': ['social', 'curious', 'wellness'],
        'sad': ['wellness', 'art', 'music', 'community'],
      };

      const compatibleMoods = moodCompatibility[currentMood.toLowerCase()] || [];
      
      return victims.filter(v => 
        compatibleMoods.includes(v.mood.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }
}

export const victimsTracker = new VictimsTracker();
