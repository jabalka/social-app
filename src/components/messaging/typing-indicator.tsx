"use client"

import type React from "react"
import { motion } from "framer-motion"

interface TypingIndicatorProps {
  isTyping: boolean
  username?: string
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, username }) => {
  if (!isTyping) return null

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 p-2">
      <span>{username ? `${username} is typing` : "Someone is typing"}</span>
      <div className="flex space-x-1">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2 }}
        />
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.3, delay: 0.1 }}
        />
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.4, delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export default TypingIndicator
