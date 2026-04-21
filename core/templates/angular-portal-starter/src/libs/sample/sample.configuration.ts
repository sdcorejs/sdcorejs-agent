import { InjectionToken } from '@angular/core';

export interface ISampleConfiguration {
  host: string;
}

export const SAMPLE_CONFIGURATION = new InjectionToken<ISampleConfiguration>('sample.configuration');
