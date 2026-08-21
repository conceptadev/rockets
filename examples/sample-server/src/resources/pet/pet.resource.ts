import { zodResource, zodSubResource } from '../../zod-bindings';
import { PetEntity, petSchema } from './pet.schema';
import { PetOwnerOrSharedHook } from '../pet-share/pet-owner-or-shared.hook';
import { AuditLogHook } from '../../audit/audit-log.hook';
import { petTagSchema } from './pet-tag.schema';
import { PetCreatedEventHook } from '../../events/pet-created-event.hook';
import { PetUniqueRefHook } from './pet-unique-ref.hook';
import { PetNameNormalizeHook } from './pet-name-normalize.hook';
import { PetTagTagIdExistsHook } from './pet-tag-tag-id-exists.hook';
import { PetCreateHandler } from './pet-create.handler';

const PetAuditLogHook = AuditLogHook.for(PetEntity);

export const petResource = zodResource({
  name: 'Pet',
  schema: petSchema,
  // No `entity:` — `PetEntity` was compiled from this same schema in
  // pet.schema.ts (eagerly, so hooks/relations can import it without a
  // cycle); zodResource reuses that registered class.
  // key / path / tags derived: `pet` → `pets` / `['Pets']`.
  owner: 'userId', // stamps userId from the actor + excludes it from create/update
  // Custom {@link PetOwnerOrSharedHook} owns read-side scoping (owner OR
  // share). Opt out of the default OwnerScopeHook so the two filters do
  // not AND together and collapse the share path.
  ownerScope: false,
  hooks: [
    // OwnerStampHook for `userId` is auto-wired from `owner` (prepended
    // ahead of these).
    PetOwnerOrSharedHook,
    PetNameNormalizeHook,
    PetUniqueRefHook,
    PetAuditLogHook,
    PetCreatedEventHook,
  ],
  operations: {
    list: true,
    read: true,
    // Reference: a zod resource with a custom command handler. `input`/
    // `output` DTOs still come from the schema; only the create command
    // path is overridden. The handler delegates to the stock CRUD write
    // (see PetCreateHandler) — the seam is what's being demonstrated.
    create: { handler: PetCreateHandler },
    update: true,
    delete: { soft: true, returnDeleted: true },
    restore: { returnRestored: true },
  },
  subResources: {
    petTags: zodSubResource({
      name: 'PetTag',
      schema: petTagSchema,
      // No `entity:` — `PetTagEntity` is the class compiled from this
      // schema in pet-tag.schema.ts; zodSubResource reuses it.
      hooks: [PetTagTagIdExistsHook],
      tags: ['Pet Tags'],
      segment: 'tags',
      // `owner` defaults to 'userId'; declared here for clarity. The auto
      // guard checks the actor owns the parent pet via this column. Set
      // `owner: false` for a public parent.
      owner: 'userId',
      // Eager `tag` relation needs reloading because TypeORM `save()`
      // omits eager loads. Opt-in to keep the cost explicit.
      reloadAfterCreate: true,
      // PathScopeHook (filter by :petId, stamp petId on create) and
      // PathScopeGuard (authenticated actor + parent owner check) are
      // auto-injected by defineSubResource; the pet/tag relation entries
      // come from the schema's FK relation meta (`include: 'default'`).
      operations: { list: true, read: true, create: true, delete: true },
    }),
  },
});
