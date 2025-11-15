import { AssetRepository } from '../database/repositories/AssetRepository.js';

/**
 * AssetService
 * Animation system removed - static layers only
 * This class is maintained as a stub to avoid breaking backend references
 */
export class AssetService {
  constructor(private assetRepository: AssetRepository) {}

  // Animation system removed - all methods are stubs
  async getAnimationLibrary(forceRefresh = false): Promise<any> {
    throw new Error('Animation system has been removed');
  }

  async getArtistAnimations(artistFolder: string): Promise<any[] | null> {
    throw new Error('Animation system has been removed');
  }

  async getAnimationMetadata(artistFolder: string, animationName: string): Promise<any | null> {
    throw new Error('Animation system has been removed');
  }

  async getAnimationFramePaths(artistFolder: string, animationName: string): Promise<string[]> {
    throw new Error('Animation system has been removed');
  }

  async validateAnimation(artistFolder: string, animationName: string): Promise<boolean> {
    return false;
  }

  async refreshCache(): Promise<void> {
    // No-op
  }

  private isValidFolderName(folderName: string): boolean {
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(folderName);
  }

  async getAllArtists(): Promise<string[]> {
    return [];
  }

  async validateArtistSetup(artistFolder: string): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: false, errors: ['Animation system has been removed'] };
  }
}
