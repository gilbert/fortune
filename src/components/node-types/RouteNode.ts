import m from '../../../vendor/mithril/index.js'
import * as App from '../../App.js'

type Attrs = {
  app: App.State
  node: App.RouteNode
}
type State = {
  url_: null | string
}

export default {

  oninit({ state }) {
    state.url_ = null
  },

  oncreate({ state, attrs, dom }) {
    var {app, node} = attrs
    var isActive = app.active && app.active.node.id === node.id
    if (isActive) {
      select(state, attrs, dom)
    }
  },

  view({ state, attrs }) {
    var {app, node} = attrs
    var isActive = app.active && app.active.node.id === node.id

    return m('.node', {
      key: node.id,
      class: `node-${node.type} ${isActive ? 'active' : 'no-select'}`,
      style: {
        width: node.size[0] * 50 + 'px',
        height: node.size[1] * 50 + 'px',
        transform: `translate(${node.pos.x}px, ${node.pos.y}px)`,
      }
    },
      m('.handle', {
        class: isActive ? '' : 'hand',
        onclick: (e:any) => select(state, attrs, e.currentTarget.closest('.node')),
      },
        m('.name', node.name),
      ),
      m('.content.d-flex-column',

        m('input[name=url][type=text].tab-focus.flex.text-mono', {
          value: state.url_ !== null ? state.url_ : node.url,
          onfocus(e: any) {
            console.log("FOCUS")
            select(state, attrs, e.currentTarget.closest('.node'))
            state.url_ = node.url
            App.current.enterEditMode()
          },
          oninput(e: any) {
            state.url_ = e.target.value
          },
          onkeypress(e: any) {
            if (e.key === 'Escape') {
              e.target.blur()
              e.preventDefault() // propogate
            }
          },
          onkeydown(e: any) {
            if (e.key === 'Tab') {
              e.preventDefault() // just ignore until we get a proper editor in here
            }
          }
        })
      ),
    )
  }
} as m.Component<Attrs,State>


function select (state: State, attrs: Attrs, dom: Element) {
  var {node} = attrs

  App.current.selectNode(node.id, {
    onedit: (keyboard, exitEditMode) => {
      ;(dom.querySelector('input[name=url]') as HTMLElement).focus()
      keyboard.bindGlobal('esc', e => {
        App.current.updateNode({ ...node, url: state.url_ || '' })
        state.url_ = null
        exitEditMode()
      })
    },
    offedit: () => {},
  })
}
