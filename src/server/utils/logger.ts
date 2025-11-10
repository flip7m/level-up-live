import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: unknown
}

class Logger {
  private logsDir: string

  constructor() {
    this.logsDir = path.resolve(__dirname, '../../..', 'data', 'logs')
    this.ensureLogsDir()
  }

  private ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true })
    }
  }

  private formatEntry(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const entry: LogEntry = {
      timestamp,
      level: level as LogEntry['level'],
      message,
      ...(data && { data }),
    }
    return JSON.stringify(entry)
  }

  private writeLog(level: string, message: string, data?: unknown) {
    const formatted = this.formatEntry(level, message, data)
    const logFile = path.join(this.logsDir, 'app.log')

    console.log(`[${level.toUpperCase()}] ${message}`, data || '')

    try {
      fs.appendFileSync(logFile, formatted + '\n')
    } catch (err) {
      console.error('Failed to write log file:', err)
    }
  }

  info(message: string, data?: unknown) {
    this.writeLog('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.writeLog('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.writeLog('error', message, data)
  }

  debug(message: string, data?: unknown) {
    this.writeLog('debug', message, data)
  }
}

export const logger = new Logger()
