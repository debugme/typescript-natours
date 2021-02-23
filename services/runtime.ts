import { Services } from './services'

type AsyncFunc = () => Promise<any>

export class Runtime {
  private list: AsyncFunc[] = []
  constructor(private services: Services) {}
  onError = (asyncFunc: () => Promise<any>) => this.list.push(asyncFunc)
  connect = async () => {
    this.list.push(async () => await Promise.resolve(process.exit(1)))
    const cleanUp = async (error: Error) => {
      for (const asyncFunc of this.list) await asyncFunc()
    }
    process.on('uncaughtException', cleanUp)
    process.on('unhandledRejection', cleanUp)
  }
}
