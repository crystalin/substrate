const k8s = require('./k8s')
const CONFIG = require('../../CONFIG')
const { pollUntil } = require('../utils/wait')

const readOrCreateNamespace = async (namespace) => {
    try {
        console.log('Reading namespace')
        await k8s.readNameSpace(namespace)  // if namespace is available, do not create here
    } catch (error) {
        console.log('Namespace not presented, creating...')
        await k8s.createNameSpace(namespace)
    }
    CONFIG.namespace = namespace
    CONFIG.update()
}

const createBootNode = async (spec) => {
    CONFIG.bootnode = {}
}

const createValidator = async () => {

}

const createDevNode = async (image, port) => {
    const substrateArgs = ['--dev', '--rpc-external', '--ws-external']
    const nodeSpec = {
        nodeId: 'node-1',
        image,
        ports: [{containerPort: port}],
        args: substrateArgs
    }
    console.log('Creating...')
    await k8s.createPod(nodeSpec, CONFIG.namespace)
    CONFIG.image = image
    CONFIG.update()
    const pod = await pollUntil(
        () => k8s.getPod('node-1', CONFIG.namespace)
    )
    CONFIG.nodes = [
        {
            "podName": 'node-1',
            "ip": pod.status.podIP,
            "port": port,
        }
    ]
    CONFIG.update()
}

const cleanup = async (namespace) => {
    await k8s.deleteNameSpace(namespace)
    if (namespace === CONFIG.namespace) {
        CONFIG.reset()
    }
}

module.exports = {readOrCreateNamespace, createBootNode, createValidator, createDevNode, cleanup}
