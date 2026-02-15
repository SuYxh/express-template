import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { PERMISSION_LIST, DEFAULT_ROLES } from '../src/config/permissions';

const prisma = new PrismaClient();

const TEST_USERS = [
  { email: 'superadmin1@example.com', nickname: '超级管理员1', role: 'super_admin' },
  { email: 'superadmin2@example.com', nickname: '超级管理员2', role: 'super_admin' },
  { email: 'admin1@example.com', nickname: '管理员1', role: 'admin' },
  { email: 'admin2@example.com', nickname: '管理员2', role: 'admin' },
  { email: 'developer1@example.com', nickname: '开发者1', role: 'developer' },
  { email: 'developer2@example.com', nickname: '开发者2', role: 'developer' },
  { email: 'pro1@example.com', nickname: 'Pro用户1', role: 'pro' },
  { email: 'pro2@example.com', nickname: 'Pro用户2', role: 'pro' },
  { email: 'plus1@example.com', nickname: 'Plus用户1', role: 'plus' },
  { email: 'plus2@example.com', nickname: 'Plus用户2', role: 'plus' },
  { email: 'user1@example.com', nickname: '普通用户1', role: 'user' },
  { email: 'user2@example.com', nickname: '普通用户2', role: 'user' },
  { email: 'guest1@example.com', nickname: '访客1', role: 'guest' },
  { email: 'guest2@example.com', nickname: '访客2', role: 'guest' },
];

async function main() {
  console.log('🌱 开始初始化数据...');

  console.log('📝 创建权限...');
  for (const permission of PERMISSION_LIST) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: {
        code: permission.code,
        name: permission.name,
        module: permission.module,
      },
    });
  }
  console.log(`✅ 已创建 ${PERMISSION_LIST.length} 个权限`);

  console.log('👥 创建角色...');
  for (const roleData of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { code: roleData.code },
      update: {},
      create: {
        code: roleData.code,
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
    });

    const permissions = await prisma.permission.findMany({
      where: { code: { in: roleData.permissions } },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }
  console.log(`✅ 已创建 ${DEFAULT_ROLES.length} 个角色`);

  console.log('👤 创建测试用户...');
  const hashedPassword = await hashPassword('Test123456');

  for (const userData of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        nickname: userData.nickname,
      },
    });

    const role = await prisma.role.findUnique({ where: { code: userData.role } });

    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }

  console.log(`✅ 已创建 ${TEST_USERS.length} 个测试用户`);
  console.log('');
  console.log('📋 测试账号列表 (密码统一为: Test123456)');
  console.log('┌────────────────────────────┬─────────────────┬──────────────┐');
  console.log('│ 邮箱                       │ 昵称            │ 角色         │');
  console.log('├────────────────────────────┼─────────────────┼──────────────┤');
  for (const userData of TEST_USERS) {
    const roleName = DEFAULT_ROLES.find((r) => r.code === userData.role)?.name || userData.role;
    console.log(
      `│ ${userData.email.padEnd(26)} │ ${userData.nickname.padEnd(15)} │ ${roleName.padEnd(12)} │`
    );
  }
  console.log('└────────────────────────────┴─────────────────┴──────────────┘');

  console.log('');
  console.log('🎉 数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
