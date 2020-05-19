const {Command, flags} = require('@oclif/command')
const Deployment = require('../../hypervisor/deployment')
const CONFIG = require('../../config')

class CleanCommand extends Command {

  async run() {
    const {flags} = this.parse(CleanCommand)
    const {args} = this.parse(CleanCommand)
    const namespace = flags.namespace || CONFIG.namespace

    // check/create namespace
    try {
        if (namespace) {
            await Deployment.cleanup(namespace)
        } else {
            console.log('Nothing to clean up')
        }
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
    
  }
}

CleanCommand.description = `Clean up resources based on namespace
`

CleanCommand.flags = {
  namespace: flags.string({char: 'n', description: 'desired namespace to clean up', env: 'NAMESPACE'}),
}

module.exports = CleanCommand
