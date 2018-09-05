import m from '../vendor/mithril/index.js'
import patch, {setAutoFreeze, DraftObject} from '../vendor/immer/index.js'
import Mousetrap from '../vendor/mousetrap/index.js'

setAutoFreeze(false)

var idCounter = 0
var eventIdCounter = 1

type EventType = 'select-node' | 'tab'
type EventPayload<T>
  = T extends 'select-node'
  ? { nodeId: number }
  : T extends 'tab'
  ? undefined
  : never
var events: Record<EventType, Array<{ id: number, cb: Function }>> = {
  'select-node': [],
  'tab': []
}

class App {
  public states: App.State[] = [{
    nodes: [],
    active: null,
    mode: 'canvas',
  }]

  get state() { return this.states[this.states.length-1] }

  update(next: App.State) {
    this.states.push(next)
  }

  patch(updater: (state: DraftObject<App.State>) => void) {
    this.update(
      patch(this.state, state => { updater(state) })
    )
  }

  createNode(pos: App.Pos) {
    this.update(patch(this.state, state => {
      var newNode: App.FNode = {
        id: ++idCounter,
        type: 'fn',
        name: `New Node (${idCounter})`,
        content: '// FILL ME IN',
        size: [4,3],
        pos: {x: pos.x - (pos.x % 25), y: pos.y - (pos.y % 25)}
      }
      state.nodes = state.nodes.concat(newNode)
      state.active = { node: newNode, onedit: null, offedit: null }
      console.log("New node", newNode.id)
    }))
  }

  selectNode(id: number, args: {
    onedit: (keyboard: MousetrapInstance, exitEditMode: () => void) => void,
    offedit: () => void,
  }) {
    var node = this.state.nodes.find(n => n.id === id)
    this.state.active = node
      ? { node, onedit: args.onedit, offedit: args.offedit }
      : this.state.active
  }

  // Events
  on<T extends EventType>(eventName: T, f: (payload: EventPayload<T>) => void) {
    events[eventName].push({ id: eventIdCounter++, cb: f })
  }
  off(eventName: EventType, callbackId: number) {
    events[eventName] = events[eventName].filter(listener => listener.id !== callbackId)
  }
  emit<T extends EventType>(eventName: T, payload: EventPayload<T>) {
    events[eventName].forEach(listener => listener.cb(payload))
  }
}

const app = new App()

export default app


var canvasMode = new Mousetrap((window as any).document)
var editMode: null | MousetrapInstance = null

const MOVE_MOD = 25
canvasMode.bind(['up', 'shift+up'], e => {
  const active = app.state.active
  if ( ! active ) return;
  active.node.pos.y -= MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['down','shift+down'], e => {
  const active = app.state.active
  if ( ! active ) return;
  active.node.pos.y += MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['right','shift+right'], e => {
  const active = app.state.active
  if ( ! active ) return;
  active.node.pos.x += MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['left','shift+left'], e => {
  const active = app.state.active
  if ( ! active ) return;
  active.node.pos.x -= MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})

canvasMode.bind('tab', e => {
  e.preventDefault()
  var onedit = app.state.active && app.state.active.onedit
  if (onedit) {
    app.patch(state => state.mode = 'edit')

    canvasMode.pause()
    editMode = new Mousetrap((window as any).document)

    var exited = false
    var exitEditMode = () => {
      if (exited) return;
      exited = true
      app.patch(state => state.mode = 'canvas')

      var offedit = app.state.active && app.state.active.offedit
      if (offedit) offedit()
      editMode && editMode.destroy()
      editMode = null
      canvasMode.unpause()
      m.redraw()
    }

    onedit(editMode, exitEditMode)

    editMode.bind('tab', e => {
      e.preventDefault()
      exitEditMode()
    })

    m.redraw()
  }
})

