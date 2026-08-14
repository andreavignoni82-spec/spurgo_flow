export class OperatorsService{constructor({repository}){this.repository=repository;}listOperators(){return this.repository.list();}getOperator(id){return this.repository.getById(id);}}
