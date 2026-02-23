import { Game } from './Game.js'

const canvas = document.getElementById('gameCanvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const game = new Game(canvas)
game.updateUI()

// Input handling
const input = document.getElementById('typeInput')

input.addEventListener('input', (e) => {
  if (!game.running) return

  const val = e.target.value
  if (val.length === 0) return

  // Process each character
  const lastChar = val[val.length - 1]
  game.currentInput = val
  game.handleInput(lastChar)

  // Check if word completed (clear input)
  if (!game.activeWord) {
    input.value = ''
    game.currentInput = ''
  }
})

input.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    // Space/Enter - deselect current word
    if (game.activeWord) {
      game.activeWord.active = false
      game.activeWord.typed = ''
      game.activeWord = null
      input.value = ''
      game.currentInput = ''
    }
  }
  if (e.key === 'Backspace') {
    e.preventDefault()
    if (game.activeWord && game.activeWord.typed.length > 0) {
      game.activeWord.typed = game.activeWord.typed.slice(0, -1)
      if (game.currentInput.length > 0) {
        game.currentInput = game.currentInput.slice(0, -1)
        input.value = game.currentInput
      }
      if (game.activeWord.typed.length === 0) {
        game.activeWord.active = false
        game.activeWord = null
        input.value = ''
        game.currentInput = ''
      }
    }
  }
})

// Focus input always
document.addEventListener('click', () => input.focus())
document.addEventListener('keydown', () => input.focus())
input.focus()

// Start button
window.startGame = function () {
  document.getElementById('overlay').style.display = 'none'
  document.getElementById('overlay').querySelector('h1').textContent = 'TYPING SHOOTER'
  document.getElementById('finalStats').style.display = 'none'
  document.getElementById('startBtn').textContent = 'СТАРТ'
  input.value = ''
  game.currentInput = ''
  game.start()
  input.focus()
}
