import * as fs from 'fs';
import * as path from 'path';
import type { AnimationLibrary, AnimationMetadata } from '../../shared/types';

/**
 * AssetRepository
 * Responsible for scanning and caching animation assets from the filesystem
 * No database interaction - purely filesystem-based
 */
export class AssetRepository {
  private assetsBasePath: string;
  private cache: AnimationLibrary | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  constructor(assetsBasePath: string) {
    this.assetsBasePath = assetsBasePath;
  }

  /**
   * Get the complete animation library with optional cache refresh
   */
  async getAnimationLibrary(forceRefresh = false): Promise<AnimationLibrary> {
    // Return cached data if valid
    if (!forceRefresh && this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache;
    }

    const library: AnimationLibrary = {};
    const artistsPath = path.join(this.assetsBasePath, 'imagens', 'artistas');

    try {
      // Check if artistas directory exists
      if (!fs.existsSync(artistsPath)) {
        console.warn(`Artists directory not found: ${artistsPath}`);
        this.cache = library;
        this.cacheTimestamp = Date.now();
        return library;
      }

      // Get all artist folders
      const artistFolders = fs.readdirSync(artistsPath).filter(file => {
        const fullPath = path.join(artistsPath, file);
        return fs.statSync(fullPath).isDirectory();
      });

      // Scan each artist folder
      for (const artistFolder of artistFolders) {
        const artistPath = path.join(artistsPath, artistFolder);
        const staticImagePath = path.join(artistPath, 'static.png');
        const animationsPath = path.join(artistPath, 'animations');

        // Check if static image exists
        const staticImageExists = fs.existsSync(staticImagePath);
        if (!staticImageExists) {
          console.warn(`Static image not found for artist: ${artistFolder}`);
          continue;
        }

        // Scan animations folder if it exists
        const animations: Record<string, AnimationMetadata> = {};

        if (fs.existsSync(animationsPath)) {
          const animationNames = fs.readdirSync(animationsPath).filter(file => {
            const fullPath = path.join(animationsPath, file);
            return fs.statSync(fullPath).isDirectory();
          });

          for (const animationName of animationNames) {
            const animationPath = path.join(animationsPath, animationName);
            const frames = this.getFrameCount(animationPath);

            if (frames > 0) {
              const fps = this.getRecommendedFps(animationName);
              const duration = (frames / fps) * 1000; // Convert to ms

              animations[animationName] = {
                name: animationName,
                frames,
                recommendedFps: fps,
                duration,
              };
            }
          }
        }

        // Add artist to library only if has animations
        if (Object.keys(animations).length > 0) {
          library[artistFolder] = {
            staticImage: `assets/imagens/artistas/${artistFolder}/static.png`,
            animations,
          };
        }
      }

      // Cache the result
      this.cache = library;
      this.cacheTimestamp = Date.now();
      return library;
    } catch (error) {
      console.error('Error scanning animation assets:', error);
      throw new Error(`Failed to scan animation assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get animations for a specific artist
   */
  async getArtistAnimations(artistFolder: string): Promise<AnimationMetadata[] | null> {
    const library = await this.getAnimationLibrary();
    const artist = library[artistFolder];

    if (!artist) {
      return null;
    }

    return Object.values(artist.animations);
  }

  /**
   * Validate if an animation exists for an artist
   */
  async validateAnimation(artistFolder: string, animationName: string): Promise<boolean> {
    const library = await this.getAnimationLibrary();
    const artist = library[artistFolder];

    if (!artist) {
      return false;
    }

    return animationName in artist.animations;
  }

  /**
   * Get frame paths for a specific animation
   */
  async getAnimationFrames(artistFolder: string, animationName: string): Promise<string[]> {
    const artistsPath = path.join(this.assetsBasePath, 'imagens', 'artistas');
    const animationPath = path.join(artistsPath, artistFolder, 'animations', animationName);

    if (!fs.existsSync(animationPath)) {
      return [];
    }

    try {
      const files = fs.readdirSync(animationPath)
        .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
        .sort((a, b) => {
          // Sort by numeric part in filename
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      return files.map(file => `assets/imagens/artistas/${artistFolder}/animations/${animationName}/${file}`);
    } catch (error) {
      console.error(`Error getting animation frames: ${error}`);
      return [];
    }
  }

  /**
   * Force refresh of the animation cache
   */
  async refreshCache(): Promise<void> {
    await this.getAnimationLibrary(true);
  }

  /**
   * Count valid PNG/JPG frames in a directory
   */
  private getFrameCount(dirPath: string): number {
    try {
      const files = fs.readdirSync(dirPath);
      return files.filter(file => /\.(png|jpg|jpeg)$/i.test(file)).length;
    } catch {
      return 0;
    }
  }

  /**
   * Get recommended FPS based on animation name
   * Can be overridden with database config later
   */
  private getRecommendedFps(animationName: string): number {
    const recommendations: Record<string, number> = {
      idle: 8,
      default: 8,
      breathing: 8,
      stand: 8,
      dance: 12,
      'dance-intense': 12,
      jump: 12,
      celebrate: 10,
      'thank-you': 10,
      wave: 10,
      nod: 10,
      smile: 8,
      pose: 10,
      excited: 12,
      energy: 12,
    };

    return recommendations[animationName] || 10; // Default 10 fps
  }
}
