import * as T from './AppTypes.js'

var idCounter = 0

export function makeRoute(pos: T.Pos): T.RouteNode {
  var id = ++idCounter
  return {
    id: id,
    type: 'node:route',
    name: `route_${id}`,

    url: '/blog/:title',
    method: 'GET',

    size: [4,1],
    pos: {x: pos.x - (pos.x % 25), y: pos.y - (pos.y % 25)},
    in: [],
    out: [],
  }
}
export function makeFn(pos: T.Pos): T.FnNode {
  var id = ++idCounter
  return {
    id: ++id,
    type: 'node:fn',
    name: `untitled_fn_${id}`,

    content: '// TODO: FILL ME IN',

    size: [4,1],
    pos: {x: pos.x - (pos.x % 25), y: pos.y - (pos.y % 25)},
    in: [],
    out: [],
  }
}
