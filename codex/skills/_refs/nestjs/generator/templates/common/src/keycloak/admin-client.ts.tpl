export interface KeycloakClientRecord {
  id?: string;
  clientId?: string;
}

export interface KeycloakAdminTransport {
  findClients(clientId: string): Promise<readonly KeycloakClientRecord[]>;
  createClient(clientId: string): Promise<KeycloakClientRecord>;
  rotateSecret(internalClientUuid: string): Promise<void>;
}

export class KeycloakAdminClient {
  constructor(private readonly transport: KeycloakAdminTransport) {}

  async resolveInternalClientUuid(clientId: string): Promise<string> {
    const matches = await this.transport.findClients(clientId);
    const exact = matches.filter((client) => client.clientId === clientId && client.id);
    if (exact.length !== 1) throw new Error('Keycloak client resolution is ambiguous.');
    return exact[0]!.id!;
  }

  async ensureClient(clientId: string): Promise<string> {
    const matches = await this.transport.findClients(clientId);
    const exact = matches.filter((client) => client.clientId === clientId && client.id);
    if (exact.length > 1) throw new Error('Keycloak client resolution is ambiguous.');
    if (exact.length === 1) return exact[0]!.id!;
    const created = await this.transport.createClient(clientId);
    if (created.clientId !== clientId || !created.id) throw new Error('Keycloak client provisioning returned no internal UUID.');
    return created.id;
  }

  async rotateClientSecret(clientId: string): Promise<void> {
    const internalClientUuid = await this.ensureClient(clientId);
    await this.transport.rotateSecret(internalClientUuid);
  }
}
