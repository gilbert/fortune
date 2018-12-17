import {MousetrapInstance} from '../vendor/mousetrap/index.js'

export type NodeId = number
export type Edges = NodeId[]

export type NodeBase = {
  id: NodeId
  name: string
  size: [number, number]
  pos: Pos
  in: Edges
  out: Edges
}

export type Pos = { x: number, y: number }

export type FnNode = NodeBase & {
  type: 'node:fn'
  content: string
}
export type RouteNode = NodeBase & {
  type: 'node:route'
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
}

export type AnyNode = FnNode | RouteNode
export type NodesByType = {
  'node:fn': FnNode
  'node:route': RouteNode
}

export type State = {
  mode: 'canvas' | 'edit'
  rootNodeIds: NodeId[]
  nodeMap: Record<NodeId,AnyNode>
  active: null | Active
}
export type Active = {
  node: AnyNode
  onedit: null | ((keyboard: MousetrapInstance, exitEditMode: () => void) => void)
  offedit: null | (() => void)
}
