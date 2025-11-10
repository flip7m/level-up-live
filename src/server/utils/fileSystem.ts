import fs from 'fs'
import path from 'path'
import { logger } from './logger.js'

/**
 * Ensures a directory exists, creates it if it doesn't
 */
export function ensureDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      logger.info(`Created directory: ${dirPath}`)
    }
  } catch (err) {
    logger.error(`Failed to create directory: ${dirPath}`, err)
    throw err
  }
}

/**
 * Removes unsafe characters from filenames for Windows compatibility
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace Windows-unsafe characters: < > : " / \ | ? *
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .slice(0, 255) // Windows max filename length
}

/**
 * Validates file extension
 */
export function isValidAudioFile(filename: string): boolean {
  const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a']
  const ext = path.extname(filename).toLowerCase()
  return validExtensions.includes(ext)
}

/**
 * Validates image file extension
 */
export function isValidImageFile(filename: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  const ext = path.extname(filename).toLowerCase()
  return validExtensions.includes(ext)
}

/**
 * Gets file size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (err) {
    logger.error(`Failed to get file size: ${filePath}`, err)
    return 0
  }
}

/**
 * Converts absolute path to relative path for assets
 */
export function getRelativeAssetPath(basePath: string, fullPath: string): string {
  return path.relative(basePath, fullPath).replace(/\\/g, '/')
}

/**
 * Resolves an asset path properly
 */
export function resolveAssetPath(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath).replace(/\\/g, '/')
}

/**
 * Lists files in a directory
 */
export function listFilesInDir(
  dirPath: string,
  extension?: string
): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)

    if (extension) {
      return files.filter((f) => f.endsWith(extension))
    }

    return files
  } catch (err) {
    logger.error(`Failed to list files in directory: ${dirPath}`, err)
    return []
  }
}

/**
 * Deletes a file
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      logger.info(`Deleted file: ${filePath}`)
    }
  } catch (err) {
    logger.error(`Failed to delete file: ${filePath}`, err)
    throw err
  }
}
