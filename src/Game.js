import { getWords } from './words.js'
import { Word } from './Word.js'
import { ParticleSystem } from './particles.js'

const COLORS = ['#00ffff', '#ff00ff', '#00ff88', '#ff8800', '#8888ff']
const MAX_LIVES = 5
const WORDS_ON_SCREEN = 6

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = new ParticleSystem()
    this.reset()
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  reset() {
    this.words = []
    this.score = 0
    this.level = 1
    this.lives = MAX_LIVES
    this.combo = 1
    this.comboCount = 0
    this.totalTyped = 0
    this.totalErrors = 0
    this.wordsCompleted = 0
    this.startTime = Date.now()
    this.lastWordTime = 0
    this.spawnInterval = 2500
    this.wordSpeed = 0.04
    this.running = false
    this.gameOver = false
    this.lastTime = 0
    this.particles = new ParticleSystem()
    this.wordPool = getWords(1)
    this.screenFlash = 0
    this.currentInput = ''
    this.activeWord = null
  }

  start() {
    this.reset()
    this.running = true
    this.startTime = Date.now()
    this.lastTime = performance.now()
    requestAnimationFrame((t) => this.loop(t))
  }

  getSpawnInterval() {
    return Math.max(800, 2500 - (this.level - 1) * 200)
  }

  getWordSpeed() {
    return 0.03 + (this.level - 1) * 0.01
  }

  getFontSize() {
    return Math.max(14, 22 - this.level)
  }

  spawnWord() {
    const pool = getWords(this.level)
    const text = pool[Math.floor(Math.random() * pool.length)]
    const margin = 80
    const x = margin + Math.random() * (this.canvas.width - margin * 2)
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const speed = this.getWordSpeed() * (0.8 + Math.random() * 0.4)
    const word = new Word(text, x, 80, speed, color)
    word.fontSize = this.getFontSize()
    this.words.push(word)
  }

  handleInput(char) {
    if (!this.running) return

    // Find active word or match first char
    if (!this.activeWord) {
      // Find first word starting with char
      const match = this.words.find(w => w.remaining[0] === char)
      if (match) {
        this.activeWord = match
        match.active = true
      } else {
        this.totalErrors++
        this.screenFlash = 0.3
        this.combo = 1
        this.comboCount = 0
        this.updateUI()
        return
      }
    }

    const word = this.activeWord
    if (word.remaining[0] === char) {
      word.typed += char
      word.hitTimer = 0.15
      this.totalTyped++

      // Spark at word position
      this.particles.hitEffect(word.x, word.y)

      if (word.isComplete) {
        this.destroyWord(word)
      }
    } else {
      this.totalErrors++
      this.screenFlash = 0.2
      this.combo = 1
      this.comboCount = 0
    }

    this.updateUI()
  }

  destroyWord(word) {
    const idx = this.words.indexOf(word)
    if (idx !== -1) this.words.splice(idx, 1)

    this.comboCount++
    if (this.comboCount >= 3) this.combo = Math.min(10, Math.floor(this.comboCount / 3) + 1)

    const points = word.text.length * 10 * this.combo * this.level
    this.score += points
    this.wordsCompleted++
    this.activeWord = null

    this.particles.explode(word.x, word.y, word.color, 25)

    // Level up check
    if (this.wordsCompleted % 10 === 0) {
      this.levelUp()
    }

    this.updateUI()
  }

  levelUp() {
    if (this.level < 7) {
      this.level++
      const el = document.getElementById('levelUp')
      el.style.opacity = '1'
      el.textContent = `LEVEL ${this.level}!`
      setTimeout(() => { el.style.opacity = '0' }, 1500)
    }
  }

  missedWord(word) {
    this.words = this.words.filter(w => w !== word)
    if (this.activeWord === word) this.activeWord = null
    this.lives--
    this.combo = 1
    this.comboCount = 0
    this.screenFlash = 0.5
    this.updateUI()

    if (this.lives <= 0) this.endGame()
  }

  get wpm() {
    const mins = (Date.now() - this.startTime) / 60000
    if (mins < 0.01) return 0
    return Math.round((this.totalTyped / 5) / mins)
  }

  get accuracy() {
    const total = this.totalTyped + this.totalErrors
    if (total === 0) return 100
    return Math.round((this.totalTyped / total) * 100)
  }

  updateUI() {
    document.getElementById('wpmVal').textContent = this.wpm
    document.getElementById('accVal').textContent = this.accuracy + '%'
    document.getElementById('lvlVal').textContent = this.level
    document.getElementById('scoreVal').textContent = this.score
    document.getElementById('comboDisplay').textContent = `x${this.combo}`

    // Lives
    const livesEl = document.getElementById('lives')
    livesEl.innerHTML = ''
    for (let i = 0; i < MAX_LIVES; i++) {
      const h = document.createElement('span')
      h.className = 'heart' + (i >= this.lives ? ' dead' : '')
      h.textContent = '♥'
      livesEl.appendChild(h)
    }
  }

  endGame() {
    this.running = false
    this.gameOver = true

    document.getElementById('finalWpm').textContent = this.wpm
    document.getElementById('finalAcc').textContent = this.accuracy + '%'
    document.getElementById('finalScore').textContent = this.score
    document.getElementById('finalLvl').textContent = this.level

    const overlay = document.getElementById('overlay')
    overlay.style.display = 'flex'
    document.getElementById('finalStats').style.display = 'flex'
    document.getElementById('overlay').querySelector('h1').textContent = 'GAME OVER'
    document.getElementById('startBtn').textContent = 'ЗНОВУ'
  }

  loop(timestamp) {
    if (!this.running) return

    const deltaTime = Math.min((timestamp - this.lastTime) / 16.67, 3)
    this.lastTime = timestamp

    // Spawn words
    if (timestamp - this.lastWordTime > this.getSpawnInterval()) {
      if (this.words.length < WORDS_ON_SCREEN) {
        this.spawnWord()
      }
      this.lastWordTime = timestamp
    }

    // Update
    this.particles.update()
    for (const word of [...this.words]) {
      word.update(deltaTime)
      if (word.y > this.canvas.height - 80) {
        this.missedWord(word)
      }
    }

    if (this.screenFlash > 0) this.screenFlash -= 0.05 * deltaTime

    // Draw
    this.draw()

    requestAnimationFrame((t) => this.loop(t))
  }

  draw() {
    const { ctx, canvas } = this
    const W = canvas.width
    const H = canvas.height

    // Background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, W, H)

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(0,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Screen flash on error
    if (this.screenFlash > 0) {
      ctx.save()
      ctx.globalAlpha = Math.max(0, this.screenFlash)
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, W, H)
      ctx.restore()
    }

    // Danger zone line
    const dangerY = H - 90
    ctx.strokeStyle = `rgba(255,0,85,0.4)`
    ctx.lineWidth = 1
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(0, dangerY)
    ctx.lineTo(W, dangerY)
    ctx.stroke()
    ctx.setLineDash([])

    // Words
    for (const word of this.words) {
      word.draw(ctx, W)
    }

    // Particles
    this.particles.draw(ctx)

    // Current input echo at bottom
    if (this.currentInput) {
      ctx.save()
      ctx.font = 'bold 20px Courier New'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(0,255,255,0.3)'
      ctx.fillText(this.currentInput, W / 2, H - 25)
      ctx.restore()
    }
  }
}
