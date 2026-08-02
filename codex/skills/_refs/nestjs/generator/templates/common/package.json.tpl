{
  "name": "{{PACKAGE_NAME}}",
  "version": "0.0.0",
  "private": true,
  "engines": { "node": ">=18.18" },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test:unit": "npm run build && node --test dist/test/unit/item-policy.spec.js dist/test/unit/item-service.spec.js dist/test/config-abuse.spec.js dist/test/admin-security.spec.js dist/test/keycloak-saga.spec.js",
    "test:integration": "npm run build && node --test dist/test/integration/item-repository.spec.js dist/test/integration/item-route-audit.spec.js",
    "test:e2e": "npm run build && node --test dist/test/e2e/item-auth.e2e-spec.js dist/test/e2e/item-validation.e2e-spec.js dist/test/e2e/item-read-only.e2e-spec.js",
    "test:profile": "{{#SIMPLE}}node -e \"process.exit(0)\"{{/SIMPLE}}{{#ENTERPRISE}}npm run build && node --test dist/test/tenant-isolation.spec.js dist/test/workflow-concurrency.spec.js dist/test/bulk-import.spec.js dist/test/export-scope.spec.js{{/ENTERPRISE}}",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e && npm run test:profile"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@sdcorejs/nestjs": "^1.0.0",
    "express": "^5.1.0",
    "jose": "^5.9.6",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.20",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.2",
    "supertest": "^7.0.0",
    "typescript": "^5.7.0"
  }
}
