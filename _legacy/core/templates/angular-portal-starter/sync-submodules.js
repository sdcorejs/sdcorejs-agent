const { execSync } = require('child_process');

try {
  // 1. Lấy tên branch hiện tại của repo cha
  const branchName = execSync('git branch --show-current').toString().trim();
  console.log(`\n📌 Đang đồng bộ cho nhánh: ${branchName}...\n`);

  // 2. Pull code mới nhất của repo cha
  console.log('⬇️ Đang pull code repo cha...');
  execSync('git pull', { stdio: 'inherit' });

  // 3. Fetch và checkout code cho các submodules
  console.log('\n🔄 Đang cập nhật submodules...');
  const submoduleCommand = `git submodule foreach "git fetch -p origin && git checkout -B ${branchName} origin/${branchName}"`;
  execSync(submoduleCommand, { stdio: 'inherit' });
  console.log('\n✅ Đồng bộ thành công!');
} catch (error) {
  console.error('\n❌ Có lỗi xảy ra trong quá trình đồng bộ:');
  console.error(error.message);
  process.exit(1);
}