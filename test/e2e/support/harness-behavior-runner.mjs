export function runScenario(policy, scenario, capabilities) {
  const classification = policy.classifyTask(scenario);
  const action = policy.resolveAction({ task: scenario, classification });
  const interaction = policy.selectInteraction({
    capabilities,
    options: Array.isArray(scenario.options) ? scenario.options : [],
    visual_spatial: scenario.visual_spatial === true,
    approval: scenario.approval === true,
    consent: scenario.consent ?? {},
    failed_surfaces: scenario.failed_surfaces ?? [],
  });
  return { classification, action, interaction };
}

export function assertNoEmbeddedArtifactFields(errors) {
  return errors.some((error) => /(?:full spec|full plan|repository context)/i.test(String(error)));
}
