import {State, AnyNode, NodeId} from '../AppTypes'

export default function generateAppCode (state: State) {
  var isRoot = state.rootNodeIds.reduce((result, id) => {
    result[id] = true
    return result
  }, {} as Record<NodeId,boolean>)

  return (
`const $http = require('http');
const $server = $http.createServer(($req, $res) => {
  ${state.rootNodeIds.map(id => {
    var node = state.nodeMap[id]
    switch (node.type) {
      case 'node:fn': return node.content+'\n'
      case 'node:route':
        return (
`  if ($req.method === '${node.method}' && $req.url === '${node.url}') {
    let ctx1 = {};
  ${node.out.flatMap(id => renderChild(state, 1, 1, state.nodeMap[id])).join('\n')}
  }`
        )
    }
  }).join('\n  ')}
});

$server.listen(process.env.PORT || 7777);

${Object.keys(state.nodeMap).map((idStr): string | null => {
  var node = state.nodeMap[Number(idStr)]
  switch (node.type) {
    case 'node:fn': return (
`function ${node.name} <ctx>(ctx: ctx) {
  ${node.content}
}`
    )
    case 'node:route': return null
  }

}).filter(x => x).join('\n\n')}
`)
}

function renderChild (state: State, ctxCounter: number, indent: number, node: AnyNode): string[] {
  switch (node.type) {
    case 'node:fn': return [
      `${indentSpace(indent)}let ctx${ctxCounter+1} = ${node.name}(ctx${ctxCounter});`
    ].concat(
      node.out.reduce((lines, childId, i) => {
        console.log("LINE COUNT:", lines, childId, i)
        return lines.concat(
          renderChild(state, ctxCounter+i+lines.length+1, indent, state.nodeMap[childId])
        )
      }, [] as string[])
    )
    case 'node:route':
    throw new Error('[generate-app-code] Not nestable: ' + node.type)
  }
}

function indentSpace (size: number) {
  return new Array(size).fill('  ').join('')
}
