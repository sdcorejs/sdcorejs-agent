import { ItemRepository } from '../items/item.repository';

export abstract class ScopedRepository extends ItemRepository {
  // Raw storage remains encapsulated by the concrete scoped repository.
}
