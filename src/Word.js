export class Word {
  constructor(text, x, y, speed, color) {
    this.text = text
    this.x = x
    this.y = y
    this.speed = speed
    this.color = color
    this.typed = ''       // how much user typed
    this.active = false   // currently being targeted
    this.alpha = 0        // fade in
    this.hit = false      // flash on char match
    this.hitTimer = 0
  }

  get remaining() {
    return this.text.slice(this.typed.length)
  }

  get isComplete() {
    return this.typed.length >= this.text.length
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime
    if (this.alpha < 1) this.alpha = Math.min(1, this.alpha + 0.05)
    if (this.hitTimer > 0) this.hitTimer -= deltaTime
  }

  draw(ctx, canvasWidth) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.font = `bold ${this.fontSize || 18}px 'Courier New', monospace`
    ctx.textAlign = 'left'

    const totalWidth = ctx.measureText(this.text).width
    const drawX = this.x - totalWidth / 2

    // Glow background for active word
    if (this.active) {
      ctx.shadowColor = this.color
      ctx.shadowBlur = 20
    }

    // Typed part — bright
    const typedWidth = ctx.measureText(this.typed).width
    if (this.typed.length > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 12
      ctx.fillText(this.typed, drawX, this.y)
    }

    // Remaining part
    ctx.fillStyle = this.hitTimer > 0 ? '#ffff00' : this.color
    ctx.shadowColor = this.hitTimer > 0 ? '#ffff00' : this.color
    ctx.shadowBlur = this.active ? 16 : 8
    ctx.fillText(this.remaining, drawX + typedWidth, this.y)

    ctx.restore()
  }
}
