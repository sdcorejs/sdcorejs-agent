export interface SecretProvider {
  get(reference: string): Promise<string>;
  put(reference: string, value: string): Promise<void>;
}
export class EnvironmentSecretProvider implements SecretProvider {
  async get(reference: string): Promise<string> {
    const value = process.env[reference];
    if (!value) throw new Error(`Missing secret reference: ${reference}`);
    return value;
  }

  async put(): Promise<void> {
    throw new Error('Environment secrets are read-only.');
  }
}
