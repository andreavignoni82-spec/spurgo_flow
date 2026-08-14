export class RepositoryContract {
  notImplemented(method) { throw new Error(`${this.constructor.name}.${method} is not implemented`); }
}
