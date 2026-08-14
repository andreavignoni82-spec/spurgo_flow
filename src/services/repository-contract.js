export class RepositoryContract {
  async getById(_id, _options = {}) { throw new Error('getById must be implemented'); }
  async list(_query = {}, _options = {}) { throw new Error('list must be implemented'); }
  async save(_entity, _options = {}) { throw new Error('save must be implemented'); }
  async remove(_id, _options = {}) { throw new Error('remove must be implemented'); }
}
