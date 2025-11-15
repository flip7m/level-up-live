import { Level, SceneLayer } from '@shared/types'
import { logger } from '../utils/logger.js'

export interface ComposedScene {
  backgroundImage: string
  stageImage: string
  crowdImage: string
  effectsLayers: SceneLayer[]
  transitionDuration: number
  transitionEffect: string
  metadata: {
    levelId: string
    levelOrder: number
    levelName: string
  }
}

export class SceneManager {
  /**
   * Compose a scene from level configuration
   */
  composeScene(level: Level, additionalEffects?: SceneLayer[]): ComposedScene {
    try {
      const effects: SceneLayer[] = []

      // Parse effect layers from level config
      if (Array.isArray(level.layers.effects)) {
        level.layers.effects.forEach((effectPath, index) => {
          effects.push({
            id: `effect-${index}`,
            name: `Effect ${index + 1}`,
            type: 'image',
            order: index,
            source: effectPath,
            visible: true,
            transform: {
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              rotation: 0,
              opacity: 1,
            },
            filters: [],
          })
        })
      }

      // Add additional effects if provided
      if (additionalEffects && Array.isArray(additionalEffects)) {
        const startIndex = effects.length
        additionalEffects.forEach((effect, index) => {
          effects.push({
            ...effect,
            order: startIndex + index,
          })
        })
      }

      const scene: ComposedScene = {
        backgroundImage: level.layers.background,
        stageImage: level.layers.stage,
        crowdImage: level.layers.crowd,
        effectsLayers: effects,
        transitionDuration: level.visualConfig.transitionDuration,
        transitionEffect: level.visualConfig.transitionEffect,
        metadata: {
          levelId: level.id,
          levelOrder: level.order,
          levelName: level.name,
        },
      }

      logger.debug(`Scene composed for level ${level.id}`)
      return scene
    } catch (err) {
      logger.error(`Error composing scene for level ${level.id}:`, err)
      throw err
    }
  }

  /**
   * Validate scene composition
   */
  validateScene(scene: ComposedScene): string[] {
    const errors: string[] = []

    if (!scene.backgroundImage) {
      errors.push('Background image is required')
    }

    if (!scene.stageImage) {
      errors.push('Stage image is required')
    }

    if (!scene.crowdImage) {
      errors.push('Crowd image is required')
    }

    if (scene.transitionDuration < 0) {
      errors.push('Transition duration must be >= 0')
    }

    if (!['fade', 'slide', 'zoom'].includes(scene.transitionEffect)) {
      errors.push('Invalid transition effect')
    }

    return errors
  }

  /**
   * Get scene layer by ID
   */
  getSceneLayer(scene: ComposedScene, layerId: string): SceneLayer | undefined {
    return scene.effectsLayers.find((layer) => layer.id === layerId)
  }

  /**
   * Add effect layer to scene
   */
  addEffectLayer(scene: ComposedScene, effect: SceneLayer): ComposedScene {
    const newScene = { ...scene }
    const maxOrder = Math.max(...scene.effectsLayers.map((l) => l.order), -1)

    newScene.effectsLayers = [
      ...scene.effectsLayers,
      {
        ...effect,
        order: maxOrder + 1,
      },
    ]

    logger.debug(`Effect layer added to scene: ${effect.id}`)
    return newScene
  }

  /**
   * Remove effect layer from scene
   */
  removeEffectLayer(scene: ComposedScene, layerId: string): ComposedScene {
    const newScene = { ...scene }
    newScene.effectsLayers = scene.effectsLayers.filter((l) => l.id !== layerId)

    logger.debug(`Effect layer removed from scene: ${layerId}`)
    return newScene
  }

  /**
   * Update effect layer in scene
   */
  updateEffectLayer(scene: ComposedScene, layerId: string, updates: Partial<SceneLayer>): ComposedScene {
    const newScene = { ...scene }
    newScene.effectsLayers = scene.effectsLayers.map((layer) => {
      if (layer.id === layerId) {
        return { ...layer, ...updates }
      }
      return layer
    })

    logger.debug(`Effect layer updated in scene: ${layerId}`)
    return newScene
  }

  /**
   * Reorder effect layers
   */
  reorderEffectLayers(scene: ComposedScene, layerIds: string[]): ComposedScene {
    const newScene = { ...scene }
    const layerMap = new Map(scene.effectsLayers.map((l) => [l.id, l]))

    newScene.effectsLayers = layerIds
      .map((id) => {
        const layer = layerMap.get(id)
        if (layer) {
          return { ...layer }
        }
        return null
      })
      .filter((layer) => layer !== null) as SceneLayer[]

    // Update order numbers
    newScene.effectsLayers = newScene.effectsLayers.map((layer, index) => ({
      ...layer,
      order: index,
    }))

    logger.debug('Effect layers reordered in scene')
    return newScene
  }

  /**
   * Get scene as JSON for preview/export
   */
  serializeScene(scene: ComposedScene): string {
    return JSON.stringify(scene, null, 2)
  }

  /**
   * Deserialize scene from JSON
   */
  deserializeScene(json: string): ComposedScene {
    return JSON.parse(json)
  }
}

export default SceneManager
