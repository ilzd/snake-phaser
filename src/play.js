class PlayScene extends Phaser.Scene {
  create() {
    this.gridSize = 10
    this.cellSize = 800 / this.gridSize
    this.stepInterval = 200
    this.prevStep = 0

    this.graph = this.add.graphics()

    const middle = Math.floor(this.gridSize / 2)
    this.positions = [{ x: middle, y: middle }]

    this.moveDir = { x: 0, y: -1 }

    this.spawnFood()

    this.drawGrid()

    this.input.keyboard.on('keydown', (e) => {
      if (e.code == 'ArrowUp') {
        if (this.moveDir.y != 1) {
          this.moveDir = { x: 0, y: -1 }
          this.step()
        }
      } else if (e.code == 'ArrowDown') {
        if (this.moveDir.y != -1) {
          this.moveDir = { x: 0, y: 1 }
          this.step()
        }
      } else if (e.code == 'ArrowLeft') {
        if (this.moveDir.x != 1) {
          this.moveDir = { x: -1, y: 0 }
          this.step()
        }
      } else if (e.code == 'ArrowRight') {
        if (this.moveDir.x != -1) {
          this.moveDir = { x: 1, y: 0 }
          this.step()
        }
      }
    })

    const particles = this.add.particles('pixel')
    this.emitter = particles.createEmitter({
      quantity: 15,
      scale: { max: 4, min: 0.2 },
      alpha: { max: 1, min: 0.1 },
      speed: { max: 100, min: 20},
      lifespan: 1000,
      on: false
    })
  }

  update() {
    const deltaTime = Date.now() - this.prevStep
    if (deltaTime >= this.stepInterval) {
      this.step()
    }
  }

  drawGrid() {
    this.graph.clear()
    this.graph.lineStyle(1, 0xFFFFFF)

    let colorStep = 255 / this.positions.length
    this.positions.forEach((pos, index) => {
      const fill = Phaser.Display.Color.GetColor(0, 255, colorStep * index)
      this.graph.fillStyle(fill, 0.5)
      this.graph.fillRect(pos.x * this.cellSize, pos.y * this.cellSize, this.cellSize, this.cellSize)
    })

    this.graph.fillStyle(0xFF0000, 0.5)
    this.graph.fillRect(this.food.x * this.cellSize, this.food.y * this.cellSize, this.cellSize, this.cellSize)

    this.graph.beginPath()
    for (let i = 0; i <= this.gridSize; i++) {
      for (let j = 0; j <= this.gridSize; j++) {
        this.graph.moveTo(0, j * this.cellSize)
        this.graph.lineTo(800, j * this.cellSize)
        this.graph.moveTo(i * this.cellSize, 0)
        this.graph.lineTo(i * this.cellSize, 800)
      }
    }

    this.graph.closePath()
    this.graph.strokePath()
  }

  step() {
    const head = this.positions[0]
    const newPos = { x: head.x + this.moveDir.x, y: head.y + this.moveDir.y }
    if (this.isCellOcupied(newPos.x, newPos.y)) this.die()

    let lastX = head.x
    let lastY = head.y

    head.x = newPos.x
    head.y = newPos.y

    if (head.x < 0 || head.x >= this.gridSize ||
      head.y < 0 || head.y >= this.gridSize) {
      this.die()
    }

    for (let i = 1; i < this.positions.length; i++) {
      const newPos = { x: lastX, y: lastY }
      lastX = this.positions[i].x
      lastY = this.positions[i].y
      this.positions[i] = newPos
    }

    if (head.x == this.food.x && head.y == this.food.y) {
      this.eat()
    }

    this.prevStep = Date.now()
    this.drawGrid()
  }

  eat() {
    this.spawnFood()
    this.positions.push({ x: -1, y: -1 })

    const head = this.positions[0]
    const headCenter = { x: head.x * this.cellSize + this.cellSize / 2, y: head.y * this.cellSize + this.cellSize / 2 }
    this.emitter.setPosition(headCenter.x, headCenter.y)
    this.emitter.explode()
  }

  die() {
    this.scene.start('menu')
  }

  spawnFood() {
    let foodX, foodY
    do {
      foodX = Phaser.Math.Between(0, this.gridSize - 1)
      foodY = Phaser.Math.Between(0, this.gridSize - 1)
    } while (this.isCellOcupied(foodX, foodY));
    this.food = { x: foodX, y: foodY }
  }

  isCellOcupied(x, y) {
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i]
      if (pos.x == x && pos.y == y) {
        return true
      }
    }

    return false
  }
}
