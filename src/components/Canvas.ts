import m from '../../vendor/mithril/index.js'
import NodeView from './NodeView.js'
import * as App from '../App.js'
import * as Nodes from '../Nodes.js'

export default {
  view() {
    return m('.relative', {
      id: "canvas",
      ondblclick: (e:any) => {
        var x = e.offsetX
        var y = e.offsetY
        console.log('click', x,y)
        App.current.addRootNode(Nodes.makeRoute({ x, y }))
      }
    },
      m('.app-mode', { class: `-${App.current.state.mode}` }, App.current.state.mode),
      App.current.rootNodes.map(node =>
        m(NodeView, { app: App.current.state, node })
      ),
      m('textarea.__temp__code-output[readonly]', App.current.generateCode()),
    )
  }
} as m.Component
