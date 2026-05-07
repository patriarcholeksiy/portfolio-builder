export class Portfolio {
  constructor(blocks = []) {
    this.blocks = blocks
  }

  addBlock(block) {
    return new Portfolio([...this.blocks, block])
  }

  removeBlock(id) {
    return new Portfolio(this.blocks.filter((block) => block.id !== id))
  }

  updateBlock(id, updater) {
    return new Portfolio(
      this.blocks.map((block) =>
        block.id === id ? { ...block, data: updater(block.data) } : block
      )
    )
  }

  moveBlock(id, direction) {
    const index = this.blocks.findIndex((block) => block.id === id)
    if (index === -1) {
      return new Portfolio(this.blocks)
    }
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= this.blocks.length) {
      return new Portfolio(this.blocks)
    }
    const next = [...this.blocks]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    return new Portfolio(next)
  }
}

