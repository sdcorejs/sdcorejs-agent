export const revision = 'ac820d70bd247a04f977aab9bbb864f6a054acb7';
export const candidateRevision = '4703643432f7eda43a1c9ccb19db6669e56575f3';
export const source = (path: string) => `https://github.com/sdcorejs/sdcorejs-agent/blob/${revision}/${path}`;
export const navigation = [
  { label: 'Khám phá', items: [
    ['Tổng quan', '/'], ['Năng lực & phạm vi', '/docs/capabilities/'],
    ['Bắt đầu sử dụng', '/docs/quickstart/'], ['Chọn workflow', '/docs/workflows/'],
  ] },
  { label: 'Áp dụng vào công việc', items: [
    ['Recipes', '/docs/recipes/'], ['Feature từ yêu cầu đến kiểm chứng', '/docs/recipes/feature/'],
    ['Cải thiện UI đang có', '/docs/recipes/ui/'], ['Chẩn đoán & sửa lỗi', '/docs/recipes/debug/'],
    ['Xây dựng ứng dụng AI-agent', '/docs/recipes/ai-agent/'],
  ] },
  { label: 'Tra cứu', items: [
    ['Thư viện skills', '/skills/'], ['Angular Core UI', '/angular/'],
    ['Artifacts & approval', '/docs/artifacts/'], ['Xử lý vướng mắc', '/docs/troubleshooting/'],
    ['Phiên bản & bằng chứng', '/docs/versions/'],
  ] },
];
const englishLabels:Record<string,string> = {
  '/':'Overview','/docs/capabilities/':'Capabilities & scope','/docs/quickstart/':'Get started','/docs/workflows/':'Choose a workflow',
  '/docs/recipes/':'Recipes','/docs/recipes/feature/':'Feature from requirements to verification','/docs/recipes/ui/':'Improve an existing UI',
  '/docs/recipes/debug/':'Diagnose & fix a bug','/docs/recipes/ai-agent/':'Build an AI-agent application','/skills/':'Skill library',
  '/angular/':'Angular Core UI','/docs/artifacts/':'Artifacts & approval','/docs/troubleshooting/':'Troubleshooting','/docs/versions/':'Versions & evidence',
};
export function getNavigation(locale:'vi'|'en') {
  return locale==='vi'?navigation:navigation.map((group,i)=>({label:['Explore','Apply to your work','Reference'][i],items:group.items.map(([,path])=>[englishLabels[path],path])}));
}
