/** Domain event: what happened. Side effects belong in `@EventsHandler` listeners. */
export class PetCreatedEvent {
  constructor(
    public readonly petId: string,
    public readonly ownerId: string,
    public readonly petName: string,
  ) {}
}
