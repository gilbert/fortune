import m from '../../vendor/mithril/index.js'
import NodeView from './NodeView.js'
import App from '../App.js'

export default {
  view() {
    return m('.relative', {
      id: "canvas",
      ondblclick: (e:any) => {
        var x = e.offsetX
        var y = e.offsetY
        console.log('click', x,y)
        App.createNode({ x, y })
      }
    },
      m('.app-mode', { class: `-${App.state.mode}` }, App.state.mode),
      App.state.nodes.map(node =>
        m(NodeView, { app: App.state, node })
      ),
    )
  }
} as m.Component
