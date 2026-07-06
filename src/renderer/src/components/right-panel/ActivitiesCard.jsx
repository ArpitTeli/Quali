import { useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { ChevronUpIcon } from 'lucide-react'

function ActivityItem({ icon, title, desc, time }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="act-item"
    >
      <div className="act-item-icon">{icon}</div>
      <div className="act-item-info">
        <p className="act-item-title">{title}</p>
        <p className="act-item-desc">{desc}</p>
      </div>
      <span className="act-item-time">{time}</span>
    </motion.div>
  )
}

export default function ActivitiesCard({ headerIcon, title, subtitle, activities }) {
  const [open, setOpen] = useState(false)

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0, duration: 0.6 }}>
      <motion.div layout className="act-card">
        <motion.button onClick={() => setOpen(!open)} className="act-card-header">
          <div className="act-card-header-left">
            <motion.div
              animate={{ width: open ? 40 : 52, height: open ? 40 : 52 }}
              className="act-card-icon-box"
            >
              <motion.div animate={{ scale: open ? 0.7 : 1 }}>
                {headerIcon}
              </motion.div>
            </motion.div>
            <div className="act-card-header-text">
              <motion.p layout className="act-card-title">{title}</motion.p>
              <AnimatePresence mode="popLayout" initial={false}>
                {!open && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="act-card-subtitle"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} className="act-card-chevron">
            <ChevronUpIcon size={18} color="#fff" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="act-card-body"
            >
              <div className="act-card-list">
                {activities.map((item, i) => (
                  <ActivityItem key={i} {...item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  )
}
