import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { Minus, Plus, X, ChevronUp, ChevronDown } from 'lucide-react'
import { FaBell, FaCheck } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import { BiSolidPencil } from 'react-icons/bi'

const NumberRoller = ({ value }) => {
  const prevRef = useRef(value)
  const dirRef = useRef(1)

  if (prevRef.current !== value) {
    dirRef.current = value >= prevRef.current ? 1 : -1
    prevRef.current = value
  }
  const direction = dirRef.current

  const variants = {
    initial: (d) => ({
      y: d * 5,
      opacity: 0,
      scale: 0,
      filter: 'blur(2px)',
    }),
    animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: (d) => ({
      y: d * -5,
      opacity: 0,
      scale: 0,
      filter: 'blur(2px)',
    }),
  }

  const strValue = value.toString().padStart(2, '0')

  return (
    <div className="nr-container">
      {strValue.split('').map((char, i) => (
        <div key={i} className="nr-digit">
          <span className="nr-digit-invisible">{char}</span>
          <AnimatePresence custom={direction} initial={false}>
            <motion.span
              key={char}
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="nr-digit-value"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

const AnimatedWord = ({ word }) => {
  return (
    <div className="aw-container">
      <AnimatePresence mode="popLayout" initial={false}>
        {word.split('').map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.3,
              delay: i * 0.0175,
            }}
            className="aw-char"
          >
            {i === 0 ? char.toUpperCase() : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

const basePill = 'er-pill'
const softBtn = 'er-soft-btn'

export default function EventReminders({ title, date: initialDate, initialReminders = [], onUpdate }) {
  const [reminders, setReminders] = useState(initialReminders)
  const [date, setDate] = useState(initialDate)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!window.electronAPI) { setLoaded(true); return }
    window.electronAPI.remindersGet().then((result) => {
      if (result && result.reminders && result.reminders.length > 0) {
        setReminders(result.reminders)
      }
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded || !window.electronAPI) return
    window.electronAPI.remindersSave(reminders)
  }, [reminders, loaded])

  const addReminder = () => {
    setReminders([
      ...reminders,
      {
        id: crypto.randomUUID(),
        type: 'Notification',
        value: 5,
        unit: 'minutes',
      },
    ])
  }

  const removeReminder = (id) =>
    setReminders(reminders.filter((r) => r.id !== id))

  const updateReminder = (id, updates) =>
    setReminders(reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)))

  const toggleUnit = (id, current) => {
    const units = ['minutes', 'hours', 'days']
    const next = units[(units.indexOf(current) + 1) % units.length]
    updateReminder(id, { unit: next })
  }

  return (
    <div className="er-wrapper">
      <motion.div
        layout
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        className="er-card"
      >
        <div className="er-header">
          <div className="er-header-info">
            <h2 className="er-title">{title}</h2>
            <AnimatePresence mode="wait">
              {isEditingDate ? (
                <motion.input
                  key="edit-date"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingDate(false)}
                  autoFocus
                  className="er-date-input"
                />
              ) : (
                <motion.p
                  key="view-date"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="er-date-text"
                >
                  {date}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setIsEditingDate(!isEditingDate)} className="er-edit-btn">
            {isEditingDate ? <FaCheck size={16} /> : <BiSolidPencil size={16} />}
          </button>
        </div>

        <div className="er-list">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  className="er-reminder"
                >
                  <motion.div
                    layout
                    onClick={() =>
                      updateReminder(reminder.id, {
                        type: reminder.type === 'Notification' ? 'Email' : 'Notification',
                      })
                    }
                    className={`${basePill} er-type-pill`}
                  >
                    <div className="er-type-left">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={reminder.type}
                          initial={{ y: 5, opacity: 0, filter: 'blur(4px)' }}
                          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                          exit={{ y: -5, opacity: 0, filter: 'blur(4px)' }}
                          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                          className="er-type-icon"
                        >
                          {reminder.type === 'Notification' ? <FaBell size={16} /> : <MdEmail size={16} />}
                        </motion.div>
                      </AnimatePresence>
                      <AnimatedWord word={reminder.type} />
                    </div>
                    <div className="er-chevron-group">
                      <ChevronUp size={12} strokeWidth={3} />
                      <ChevronDown size={12} strokeWidth={3} />
                    </div>
                  </motion.div>

                  <div className="er-value-row">
                    <div className={`${basePill} er-value-pill`}>
                      <button
                        onClick={() => updateReminder(reminder.id, { value: Math.max(1, reminder.value - 1) })}
                        className={softBtn}
                      >
                        <Minus size={14} />
                      </button>
                      <NumberRoller value={reminder.value} />
                      <button
                        onClick={() => updateReminder(reminder.id, { value: reminder.value + 1 })}
                        className={softBtn}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <motion.div
                      layout
                      onClick={() => toggleUnit(reminder.id, reminder.unit)}
                      className={`${basePill} er-unit-pill`}
                    >
                      <AnimatedWord word={reminder.unit} />
                      <div className="er-chevron-group">
                        <ChevronUp size={12} strokeWidth={3} />
                        <ChevronDown size={12} strokeWidth={3} />
                      </div>
                    </motion.div>

                    <button onClick={() => removeReminder(reminder.id)} className="er-remove-btn">
                      <X size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => updateReminder(reminder.id, { active: !reminder.active })}
                      className={`er-set-btn${reminder.active ? ' er-set-btn-active' : ''}`}
                    >
                      {reminder.active ? 'Set' : 'Set'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        <motion.button
          onClick={addReminder}
          className="er-add-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Reminder
        </motion.button>
      </motion.div>
    </div>
  )
}
