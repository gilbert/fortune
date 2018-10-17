import m from '../../vendor/mithril/index.js'
import NodeView from './NodeView.js'
import * as App from '../App.js'

export default {
  view() {
    return m('.relative', {
      id: "canvas",
      ondblclick: (e:any) => {
        var x = e.offsetX
        var y = e.offsetY
        console.log('click', x,y)
        App.current.createNode({ x, y })
      }
    },
      m('.app-mode', { class: `-${App.current.state.mode}` }, App.current.state.mode),
      App.current.state.nodes.map(node =>
        m(NodeView, { app: App.current.state, node })
      ),
    )
  }
} as m.Component
