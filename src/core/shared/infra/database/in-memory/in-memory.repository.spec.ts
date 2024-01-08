import { EmployeeId } from '../../../../employee/domain/employee.agregate';
import { Entity } from '../../../domain/entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { InMemoryRepository } from './in-memory.repository';

describe('InMemoryRepository Unit Tests', () => {
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  test('should insert a new entity', async () => {
    const entity = new StubEntity({
      entity_id: new EmployeeId(),
      name: 'Test',
      price: 100,
    });

    await repo.insert(entity);

    expect(repo.items.length).toBe(1);
    expect(repo.items[0]).toBe(entity);
  });

  it('should returns all entities', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    const entity2 = new StubEntity({ name: 'name value2', price: 3 });
    await repo.insert(entity);
    await repo.insert(entity2);

    const entities = await repo.findAll();

    expect(entities).toStrictEqual([entity, entity2]);
  });

  it('should throws error on update when entity not found', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await expect(repo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity),
    );
  });

  it('should updates an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repo.insert(entity);

    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: 'updated',
      price: 1,
    });
    await repo.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repo.items[0].toJSON());
  });

  it('should throws error on delete when entity not found', async () => {
    const uuid = new EmployeeId();
    await expect(repo.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid.id, StubEntity),
    );

    await expect(
      repo.delete(new EmployeeId('9366b7dc-2d71-4799-b91c-c64adb205104')),
    ).rejects.toThrow(
      new NotFoundError('9366b7dc-2d71-4799-b91c-c64adb205104', StubEntity),
    );
  });

  it('should deletes an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repo.insert(entity);
    await repo.delete(entity.entity_id);
    expect(repo.items).toHaveLength(0);
  });
});

type StubEntityConstructor = {
  entity_id?: EmployeeId;
  name: string;
  price: number;
};

class StubEntity extends Entity {
  entity_id: EmployeeId;
  name: string;
  price: number;

  constructor(props: StubEntityConstructor) {
    super();
    this.entity_id = props.entity_id || new EmployeeId();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON() {
    return {
      entity_id: this.entity_id.id,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<
  StubEntity,
  EmployeeId
> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}
