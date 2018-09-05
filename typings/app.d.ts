declare namespace App {
  type Pos = { x: number, y: number }
  type FNodeType = 'fn'
  type FNode
    = {
        id: number
        name: string
        type: FNodeType
        content: string
        size: [number, number]
        pos: Pos
      }


  type State = {
    mode: 'canvas' | 'edit'
    nodes: App.FNode[]
    active: null | Active
  }
  type Active = {
    node: App.FNode
    onedit: null | ((keyboard: MousetrapInstance, exitEditMode: () => void) => void)
    offedit: null | (() => void)
  }
}
