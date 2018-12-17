import m from '../../vendor/mithril/index.js'
import * as App from '../App'
import FnNode from './node-types/FnNode.js'
import RouteNode from './node-types/RouteNode.js'

type Attrs = {
  app: App.State
  node: App.AnyNode
}
type State = {
}

const NodeView = {

  view({ state, attrs }) {
    var {app, node} = attrs

    var base = getBaseNodeView(attrs)
    return [
      base,
      node.out.map(id => m(NodeView, { app, node: app.nodeMap[id] }))
    ]
  }
} as m.Component<Attrs,State>

export default NodeView

function getBaseNodeView (attrs: Attrs): m.Vnode<any,any> {
  var {app, node} = attrs
  switch (node.type) {
    case 'node:fn': return m(FnNode, { app, node })
    case 'node:route': return m(RouteNode, { app, node })
  }
}
