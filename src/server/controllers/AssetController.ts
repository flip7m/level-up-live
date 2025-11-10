import { Request, Response } from 'express'
import { readdir } from 'fs/promises'
import { resolve } from 'path'
import { extname } from 'path'

export class AssetController {
  /**
   * GET /api/assets/images - Lista todas as imagens organizadas em assets/imagens
   */
  getImageAssets = async (req: Request, res: Response) => {
    try {
      const imagesPath = resolve(process.cwd(), 'assets', 'imagens')
      const images: Record<string, string[]> = {}

      // Ler todas as pastas em assets/imagens (backgrounds, artistas, etc)
      const folders = await readdir(imagesPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(imagesPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const imageFiles = files.filter((f) =>
              ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f).toLowerCase())
            )
            images[folder.name] = imageFiles.map((f) => `assets/imagens/${folder.name}/${f}`)
          } catch (err) {
            // Pasta vazia ou erro ao ler
            images[folder.name] = []
          }
        }
      }

      res.json({
        success: true,
        data: images,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/assets/scenes - Lista todas as imagens de cenas disponíveis
   */
  getSceneAssets = async (req: Request, res: Response) => {
    try {
      const scenesPath = resolve(process.cwd(), 'assets', 'scenes')
      const scenes: Record<string, string[]> = {}

      // Ler todas as pastas em assets/scenes
      const folders = await readdir(scenesPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(scenesPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const imageFiles = files.filter((f) =>
              ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f).toLowerCase())
            )
            scenes[folder.name] = imageFiles.map((f) => `assets/scenes/${folder.name}/${f}`)
          } catch (err) {
            // Pasta vazia ou erro ao ler
            scenes[folder.name] = []
          }
        }
      }

      res.json({
        success: true,
        data: scenes,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/assets/artists - Lista todas as imagens de artistas disponíveis
   */
  getArtistAssets = async (req: Request, res: Response) => {
    try {
      const artistsPath = resolve(process.cwd(), 'assets', 'Artists')
      const artists: Record<string, string[]> = {}

      // Ler todas as pastas em assets/Artists
      const folders = await readdir(artistsPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(artistsPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const imageFiles = files.filter((f) =>
              ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f).toLowerCase())
            )
            artists[folder.name] = imageFiles.map((f) => `assets/Artists/${folder.name}/${f}`)
          } catch (err) {
            // Pasta vazia ou erro ao ler
            artists[folder.name] = []
          }
        }
      }

      res.json({
        success: true,
        data: artists,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/assets/sounds - Lista todos os sons disponíveis
   */
  getSoundAssets = async (req: Request, res: Response) => {
    try {
      const soundsPath = resolve(process.cwd(), 'assets', 'sounds')
      const sounds: Record<string, string[]> = {}

      // Ler todas as pastas em assets/sounds
      const folders = await readdir(soundsPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(soundsPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const soundFiles = files.filter((f) =>
              ['.mp3', '.wav', '.ogg', '.flac', '.m4a'].includes(extname(f).toLowerCase())
            )
            sounds[folder.name] = soundFiles.map((f) => `assets/sounds/${folder.name}/${f}`)
          } catch (err) {
            // Pasta vazia ou erro ao ler
            sounds[folder.name] = []
          }
        }
      }

      res.json({
        success: true,
        data: sounds,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/assets/all - Lista todos os assets (cenas, artistas, sons)
   */
  getAllAssets = async (req: Request, res: Response) => {
    try {
      const [scenes, artists, sounds] = await Promise.all([
        this.getSceneAssetsData(),
        this.getArtistAssetsData(),
        this.getSoundAssetsData(),
      ])

      res.json({
        success: true,
        data: {
          scenes,
          artists,
          sounds,
        },
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * Utilitários privados
   */
  private async getSceneAssetsData(): Promise<Record<string, string[]>> {
    const scenesPath = resolve(process.cwd(), 'assets', 'scenes')
    const scenes: Record<string, string[]> = {}

    try {
      const folders = await readdir(scenesPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(scenesPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const imageFiles = files.filter((f) =>
              ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f).toLowerCase())
            )
            scenes[folder.name] = imageFiles.map((f) => `assets/scenes/${folder.name}/${f}`)
          } catch (err) {
            scenes[folder.name] = []
          }
        }
      }
    } catch (err) {
      // assets/scenes não existe ou erro ao ler
    }

    return scenes
  }

  private async getArtistAssetsData(): Promise<Record<string, string[]>> {
    const artistsPath = resolve(process.cwd(), 'assets', 'Artists')
    const artists: Record<string, string[]> = {}

    try {
      const folders = await readdir(artistsPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(artistsPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const imageFiles = files.filter((f) =>
              ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f).toLowerCase())
            )
            artists[folder.name] = imageFiles.map((f) => `assets/Artists/${folder.name}/${f}`)
          } catch (err) {
            artists[folder.name] = []
          }
        }
      }
    } catch (err) {
      // assets/Artists não existe ou erro ao ler
    }

    return artists
  }

  private async getSoundAssetsData(): Promise<Record<string, string[]>> {
    const soundsPath = resolve(process.cwd(), 'assets', 'sounds')
    const sounds: Record<string, string[]> = {}

    try {
      const folders = await readdir(soundsPath, { withFileTypes: true })

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const folderPath = resolve(soundsPath, folder.name)
          try {
            const files = await readdir(folderPath)
            const soundFiles = files.filter((f) =>
              ['.mp3', '.wav', '.ogg', '.flac', '.m4a'].includes(extname(f).toLowerCase())
            )
            sounds[folder.name] = soundFiles.map((f) => `assets/sounds/${folder.name}/${f}`)
          } catch (err) {
            sounds[folder.name] = []
          }
        }
      }
    } catch (err) {
      // assets/sounds não existe ou erro ao ler
    }

    return sounds
  }
}

export default AssetController
