import { Router, Request, Response } from 'express';
import { AssetService } from '../services/AssetService.js';

// Animation system removed - static layers only

/**
 * AssetController
 * HTTP endpoints for animation asset management
 * Follows the same pattern as LevelController
 */
export class AssetController {
  private router: Router;

  constructor(private assetService: AssetService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET all animations library
    this.router.get('/animations', this.getAllAnimations.bind(this));

    // GET animations for a specific artist
    this.router.get('/animations/:artistFolder', this.getArtistAnimations.bind(this));

    // GET animation metadata
    this.router.get('/animations/:artistFolder/:animationName', this.getAnimationMetadata.bind(this));

    // GET animation frames
    this.router.get('/animations/:artistFolder/:animationName/frames', this.getAnimationFrames.bind(this));

    // POST refresh cache (admin only)
    this.router.post('/animations/refresh-cache', this.refreshCache.bind(this));

    // GET validate animation
    this.router.get('/animations/:artistFolder/:animationName/validate', this.validateAnimation.bind(this));

    // GET validate artist setup
    this.router.get('/animations/:artistFolder/validate-setup', this.validateArtistSetup.bind(this));

    // GET all available artists
    this.router.get('/artists', this.getArtists.bind(this));

    // GET all available scenes/backgrounds
    this.router.get('/scenes', this.getScenes.bind(this));

    // GET all available sounds
    this.router.get('/sounds', this.getSounds.bind(this));

    // GET all available images
    this.router.get('/images', this.getImages.bind(this));
  }

  /**
   * GET /api/assets/animations
   * Returns complete animation library
   */
  private async getAllAnimations(req: Request, res: Response): Promise<void> {
    try {
      const library = await this.assetService.getAnimationLibrary();

      res.json({
        success: true,
        data: library,
        count: Object.keys(library).length,
      });
    } catch (error) {
      console.error('Error getting animation library:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get animation library',
      });
    }
  }

  /**
   * GET /api/assets/animations/:artistFolder
   * Returns animations available for a specific artist
   */
  private async getArtistAnimations(req: Request, res: Response): Promise<void> {
    try {
      const { artistFolder } = req.params;

      const animations = await this.assetService.getArtistAnimations(artistFolder);

      if (!animations) {
        res.status(404).json({
          success: false,
          error: `Artist not found: ${artistFolder}`,
        });
        return;
      }

      res.json({
        success: true,
        data: animations,
        count: animations.length,
      });
    } catch (error) {
      console.error('Error getting artist animations:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  /**
   * GET /api/assets/animations/:artistFolder/:animationName
   * Returns metadata for a specific animation
   */
  private async getAnimationMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { artistFolder, animationName } = req.params;

      const metadata = await this.assetService.getAnimationMetadata(artistFolder, animationName);

      if (!metadata) {
        res.status(404).json({
          success: false,
          error: `Animation not found: ${artistFolder}/${animationName}`,
        });
        return;
      }

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      console.error('Error getting animation metadata:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  /**
   * GET /api/assets/animations/:artistFolder/:animationName/frames
   * Returns frame paths for an animation
   */
  private async getAnimationFrames(req: Request, res: Response): Promise<void> {
    try {
      const { artistFolder, animationName } = req.params;

      const frames = await this.assetService.getAnimationFramePaths(artistFolder, animationName);

      res.json({
        success: true,
        data: frames,
        count: frames.length,
      });
    } catch (error) {
      console.error('Error getting animation frames:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  /**
   * POST /api/assets/animations/refresh-cache
   * Force refresh the animation cache
   */
  private async refreshCache(req: Request, res: Response): Promise<void> {
    try {
      await this.assetService.refreshCache();

      res.json({
        success: true,
        message: 'Cache refreshed successfully',
      });
    } catch (error) {
      console.error('Error refreshing cache:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh cache',
      });
    }
  }

  /**
   * GET /api/assets/animations/:artistFolder/:animationName/validate
   * Validate if an animation exists
   */
  private async validateAnimation(req: Request, res: Response): Promise<void> {
    try {
      const { artistFolder, animationName } = req.params;

      const valid = await this.assetService.validateAnimation(artistFolder, animationName);

      res.json({
        success: true,
        data: { valid },
      });
    } catch (error) {
      console.error('Error validating animation:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  /**
   * GET /api/assets/animations/:artistFolder/validate-setup
   * Validate if an artist has required animations
   */
  private async validateArtistSetup(req: Request, res: Response): Promise<void> {
    try {
      const { artistFolder } = req.params;

      const result = await this.assetService.validateArtistSetup(artistFolder);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error validating artist setup:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  /**
   * GET /api/assets/artists
   * Returns all available artists (folders with animations)
   */
  private async getArtists(req: Request, res: Response): Promise<void> {
    try {
      const artists = await this.assetService.getAllArtists();
      res.json({
        success: true,
        data: artists,
        count: artists.length,
      });
    } catch (error) {
      console.error('Error getting artists:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get artists',
      });
    }
  }

  /**
   * GET /api/assets/scenes
   * Returns all available background/scene images
   */
  private async getScenes(req: Request, res: Response): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const scenesPath = path.join('assets', 'imagens', 'backgrounds');

      let scenes: string[] = [];
      if (fs.existsSync(scenesPath)) {
        // Support both images and videos in backgrounds folder
        const files = fs.readdirSync(scenesPath).filter(file =>
          /\.(png|jpg|jpeg|webp|mp4|webm|mov|avi|mkv|flv)$/i.test(file)
        );
        scenes = files.map(file => `assets/imagens/backgrounds/${file}`);
      }

      res.json({
        success: true,
        data: scenes,
        count: scenes.length,
      });
    } catch (error) {
      console.error('Error getting scenes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get scenes',
      });
    }
  }

  /**
   * GET /api/assets/sounds
   * Returns all available sound files
   */
  private async getSounds(req: Request, res: Response): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const soundsPath = path.join('assets', 'sounds');

      let sounds: string[] = [];
      if (fs.existsSync(soundsPath)) {
        const categories = fs.readdirSync(soundsPath).filter(file => {
          const fullPath = path.join(soundsPath, file);
          return fs.statSync(fullPath).isDirectory();
        });

        for (const category of categories) {
          const categoryPath = path.join(soundsPath, category);
          const files = fs.readdirSync(categoryPath).filter(file =>
            /\.(mp3|wav|ogg|m4a)$/i.test(file)
          );
          sounds.push(...files.map(file => `assets/sounds/${category}/${file}`));
        }
      }

      res.json({
        success: true,
        data: sounds,
        count: sounds.length,
      });
    } catch (error) {
      console.error('Error getting sounds:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sounds',
      });
    }
  }

  /**
   * GET /api/assets/images
   * Returns all available image files (backgrounds + artists static images)
   */
  private async getImages(req: Request, res: Response): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      let media: string[] = [];

      // Supported file types - images and videos
      const supportedExtensions = /\.(png|jpg|jpeg|webp|mp4|webm|mov|avi|mkv|flv)$/i;

      // Add background images and videos
      const backgroundsPath = path.join('assets', 'imagens', 'backgrounds');
      if (fs.existsSync(backgroundsPath)) {
        const files = fs.readdirSync(backgroundsPath).filter(file =>
          supportedExtensions.test(file)
        );
        media.push(...files.map(file => `assets/imagens/backgrounds/${file}`));
      }

      // Add artist static images
      const artistsPath = path.join('assets', 'imagens', 'artistas');
      if (fs.existsSync(artistsPath)) {
        const artists = fs.readdirSync(artistsPath).filter(file => {
          const fullPath = path.join(artistsPath, file);
          return fs.statSync(fullPath).isDirectory();
        });

        for (const artist of artists) {
          const staticPath = path.join(artistsPath, artist, 'static.png');
          if (fs.existsSync(staticPath)) {
            media.push(`assets/imagens/artistas/${artist}/static.png`);
          }
        }
      }

      res.json({
        success: true,
        data: media,
        count: media.length,
      });
    } catch (error) {
      console.error('Error getting media (images/videos):', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get media',
      });
    }
  }

  /**
   * Get the router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}
