import m from '../vendor/mithril/index.js'
import patch, {setAutoFreeze, DraftObject} from '../vendor/immer/index.js'
import Mousetrap, {MousetrapInstance} from '../vendor/mousetrap/index.js'
import generateAppCode from './backend/generate-app-code.js'
import * as AppTypes from './AppTypes'
import * as Nodes from './Nodes.js'

export * from './AppTypes'

setAutoFreeze(false)

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
  public states: AppTypes.State[] = [{
    rootNodeIds: [],
    nodeMap: {},
    active: null,
    mode: 'canvas',
  }]

  get state() { return this.states[this.states.length-1] }

  get rootNodes() { return this.state.rootNodeIds.map(id => this.state.nodeMap[id]) }

  update(next: AppTypes.State) {
    this.states.push(next)
  }

  patch(updater: (state: DraftObject<AppTypes.State>) => void) {
    this.update(
      patch(this.state, state => { updater(state) })
    )
  }

  addRootNode(newNode: AppTypes.AnyNode) {
    this.update(patch(this.state, state => {
      state.rootNodeIds = state.rootNodeIds.concat(newNode.id)
      state.nodeMap[newNode.id] = newNode
      state.active = { node: newNode, onedit: null, offedit: null }
      console.log("New node", newNode.id)
    }))
  }

  selectNode(nodeId: number, args: {
    onedit: (keyboard: MousetrapInstance, exitEditMode: () => void) => void,
    offedit: () => void,
  }) {
    var node = this.state.nodeMap[nodeId]
    this.state.active = node
      ? { node, onedit: args.onedit, offedit: args.offedit }
      : this.state.active
  }

  updateNode<NodeType extends AppTypes.AnyNode["type"]>(
    newNode: AppTypes.NodesByType[NodeType] & { id: AppTypes.NodeId }
  ): void {
    this.update(patch(this.state, state => {
      state.nodeMap[newNode.id] = newNode
    }))
  }

  extendNode<NodeType extends AppTypes.AnyNode["type"]>(
    parentId: AppTypes.NodeId,
    newNode: AppTypes.NodesByType[NodeType] & { id: AppTypes.NodeId }
  ): void {
    this.update(patch(this.state, state => {
      state.nodeMap[newNode.id] = newNode
      state.nodeMap[parentId].out = state.nodeMap[parentId].out.concat([newNode.id])
    }))
  }

  enterEditMode() {
    var onedit = this.state.active && this.state.active.onedit
    if (onedit) {
      this.patch(state => state.mode = 'edit')

      canvasMode.pause()
      editMode = new Mousetrap((window as any).document)

      var exited = false
      var exitEditMode = () => {
        if (exited) return;
        exited = true
        this.patch(state => state.mode = 'canvas')

        var offedit = this.state.active && this.state.active.offedit
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
  }

  generateCode() {
    return generateAppCode(this.state)
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

export var current = new App()


var canvasMode = new Mousetrap((window as any).document)
var editMode: null | MousetrapInstance = null

const MOVE_MOD = 25
canvasMode.bind(['up', 'shift+up'], e => {
  const active = current.state.active
  if ( ! active ) return;
  active.node.pos.y -= MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['down','shift+down'], e => {
  const active = current.state.active
  if ( ! active ) return;
  active.node.pos.y += MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['right','shift+right'], e => {
  const active = current.state.active
  if ( ! active ) return;
  active.node.pos.x += MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})
canvasMode.bind(['left','shift+left'], e => {
  const active = current.state.active
  if ( ! active ) return;
  active.node.pos.x -= MOVE_MOD * (e.shiftKey ? 5 : 1)
  m.redraw()
})

canvasMode.bind('ctrl+e', e => {
  var active = current.state.active
  if ( ! active ) return;
  console.log("eeee2")
  var newNode = Nodes.makeFn({
    x: active.node.pos.x,
    y: active.node.pos.y + active.node.size[1]*25 + 50,
  })
  current.extendNode(active.node.id, newNode)
  m.redraw()
})

canvasMode.bind('tab', e => {
  e.preventDefault()
  current.enterEditMode()
})

