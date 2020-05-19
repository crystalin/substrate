const {Command, flags} = require('@oclif/command')
const CONFIG = require('../../config')
const {succeedExit, errorExit} = require('../../hypervisor/utils/exit')
const k8s = require('../../hypervisor/deployment/k8s')

class SingleNodeHeightCommand extends Command {
  async run() {
    const {flags} = this.parse(SingleNodeHeightCommand)
    let port = flags.port
    let url = flags.url
    const wait = flags.wait || 600 * 1000
    const height = flags.height || 10
    const namespace = flags.namespace || CONFIG.namespace
    const pod = flags.pod || (CONFIG.nodes && CONFIG.nodes[0])? CONFIG.nodes[0].podName: undefined
    const jsonRpc = require('../../hypervisor/utils/json-rpc')
    const now = Date.now()

    if (!!url && !!port) {
        JsonRpcCallTestHeight(url, port)
    } else if (!!pod && !!namespace) {
        url = 'http://localhost'
        port = 9933
        await k8s.startForwardServer(namespace, pod, port, () => JsonRpcCallTestHeight(url, port))
    } else {
        succeedExit()
    }

    async function JsonRpcCallTestHeight(url, port) {
        console.log('Polling chain height...')
        if (Date.now() < now + wait) {
            try {
                const curHeight = await jsonRpc.getChainBlockHeight(url, port) // recursively call to check chainHeight, every 2sec
                console.log('Current Block Height: ' + curHeight)
                if (curHeight > height) {
                    succeedExit()
                } else {
                    setTimeout(JsonRpcCallTestHeight, 2000); 
                }
            } catch (error) {
                errorExit('error requesting chain block height')
            }
        } else {
            errorExit('Timed out')
        }
    }
  }
}

SingleNodeHeightCommand.description = `Test if targeted node is producing blocks > certain height
`

SingleNodeHeightCommand.flags = {
  port: flags.integer({char: 'p', description: 'port to deploy'}),
  url: flags.string({char: 'u', description: 'connect url'}),
  wait: flags.string({char: 'w', description: 'wait time in miliseconds to halt'}),
  height: flags.string({char: 'h', description: 'desired height to test'}),
  pod: flags.string({description: 'desired pod to test'}),
  namespace: flags.string({description: 'desired namespace to test'})
}

module.exports = SingleNodeHeightCommand
