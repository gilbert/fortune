import m from '../../vendor/mithril/index.js'
import * as App from '../App'
import FnNode from './node-types/FnNode.js'

type Attrs = {
  app: App.State
  node: App.FNode
}
type State = {
}

export default {

  view({ state, attrs }) {
    var {app, node} = attrs

    return node.type === 'fn' && m(FnNode, { app, node })
  }
} as m.Component<Attrs,State>
