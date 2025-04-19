import { DeepPartial } from '../../utils/deep-partial';
import { ReferenceIdInterface } from '../../reference/interfaces/reference-id.interface';

export interface ModelServiceInterface<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity> & ReferenceIdInterface<Entity['id']>,
  Replaceable extends Creatable & Pick<Entity, 'id'> = Creatable &
    Pick<Entity, 'id'>,
  Removable extends Pick<Entity, 'id'> = Pick<Entity, 'id'>,
> {
  byId(id: Entity['id']): Promise<Entity | null>;

  create(data: Creatable): Promise<Entity>;

  update(data: Updatable): Promise<Entity>;

  replace(data: Replaceable): Promise<Entity>;

  remove(data: Removable): Promise<Entity>;
}
