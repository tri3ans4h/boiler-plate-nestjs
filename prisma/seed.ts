import { PrismaClient, Story, Permission, Prisma } from "@prisma/client";
import { cloneDeep } from "lodash";

import * as bcrypt from 'bcrypt';

export const roles = [
  {
    id: 1,
    name: 'SuperAdmin'
  },
  {
    id: 2,
    name: 'Admin'
  },
  {
    id: 3,
    name: 'User'
  }
];

export const permissions = [
  {
    id: 1,
    role_id: 1,
    action: 'manage',
    subject: 'all'
  },
  {
    id: 2,
    role_id: 2,
    action: 'read',
    subject: 'Story',
    conditions: { created_by: '{{ id }}' }
  },
  {
    id: 3,
    role_id: 2,
    action: 'manage',
    subject: 'Story',
    conditions: { created_by: '{{ id }}' }
  }
];

export const users = [
  {
    id: 1,
    first_name: 'Super',
    last_name: 'Admin',
    role_id: 1,
    email: 'super-admin@mail.com',
    password: '123456'
  },
  {
    id: 2,
    first_name: 'Admin',
    last_name: 'Org 01',
    role_id: 2,
    email: 'admin01@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 3,
    first_name: 'Admin',
    last_name: 'Org 02',
    role_id: 2,
    email: 'admin02@mail.com',
    password: '123456',
    org_id: 2
  },
  {
    id: 4,
    first_name: 'User 01',
    last_name: 'at Org 02',
    role_id: 3,
    email: 'user01@mail.com',
    password: '123456',
    org_id: 2
  },
  {
    id: 5,
    first_name: 'User 02',
    last_name: 'at Org 02',
    role_id: 3,
    email: 'user02@mail.com',
    password: '123456',
    org_id: 2
  },
  {
    id: 6,
    first_name: 'User 03',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user03@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 7,
    first_name: 'User 04',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user04@mail.com',
    password: '123456',
    org_id: 1
  },

  {
    id: 8,
    first_name: 'User 08',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user08@mail.com',
    password: '123456',
    org_id: 1
  },

  {
    id: 9,
    first_name: 'User 09',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user09@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 10,
    first_name: 'User 10',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user10@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 11,
    first_name: 'User 11',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user11@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 12,
    first_name: 'User 12',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user12@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 13,
    first_name: 'User 13',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user13@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 14,
    first_name: 'User 14',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user14@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 15,
    first_name: 'User 15',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user15@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 16,
    first_name: 'User 16',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user16@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 17,
    first_name: 'User 17',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user17@mail.com',
    password: '123456',
    org_id: 1
  },
  {
    id: 18,
    first_name: 'User 18',
    last_name: 'at Org 01',
    role_id: 3,
    email: 'user18@mail.com',
    password: '123456',
    org_id: 1
  },
];


export const organizations = [
  {
    id: 1,
    name: 'Org 01',
  },
  {
    id: 2,
    name: 'Org 02',
  }
];



export const stories: Story[] = [
  {
    id: 1,
    name: 'Super Admin Story 01',
    created_by: 1,
    org_id: null
  },
  {
    id: 2,
    name: 'Admin 01 Story 01',
    created_by: 2,
    org_id: 1
  },

  {
    id: 3,
    name: 'Admin 01 Story 02',
    created_by: 2,
    org_id: 1
  },
  {
    id: 4,
    name: 'Admin 02 Story 01',
    created_by: 3,
    org_id: 2
  },
  {
    id: 5,
    name: 'Admin 02 Story 02',
    created_by: 3,
    org_id: 2
  }
];
const prisma = new PrismaClient();

async function main() {

  //reset auto increment
  await prisma.$queryRaw`ALTER SEQUENCE roles_id_seq RESTART WITH 1`;
  await prisma.$queryRaw`ALTER SEQUENCE organizations_id_seq RESTART WITH 1`;
  await prisma.$queryRaw`ALTER SEQUENCE users_id_seq RESTART WITH 1`;
  await prisma.$queryRaw`ALTER SEQUENCE stories_id_seq RESTART WITH 1`;

  for await (const role of roles) {
    const roleAttrs = cloneDeep(role);
    //delete roleAttrs.id;
    await prisma.role.upsert({
      where: {
        id: role.id
      },
      create: roleAttrs,
      update: roleAttrs
    });
    await prisma.$queryRaw`SELECT nextval('roles_id_seq');`;
  }

  for await (const organization of organizations) {
    const orgAttrs = cloneDeep(organization);
    //delete orgAttrs.id;
    await prisma.organizations.upsert({
      where: {
        id: organization.id
      },
      create: orgAttrs,
      update: orgAttrs
    });
    await prisma.$queryRaw`SELECT nextval('organizations_id_seq');`;
  }

  for await (const permission of permissions) {
    const permissionAttrs = cloneDeep(permission);
    //delete permissionAttrs.id;
    await prisma.permission.upsert({
      where: {
        id: permission.id
      },
      create: permissionAttrs,
      update: permissionAttrs
    });
  }

  //DATA USER
  for await (const user of users) {
    let userAttrs = cloneDeep(user);
    //userAttrs.password = await bcrypt.hash(user.password as string, 10);
    try {
      let hs = await bcrypt.hash(userAttrs.password as string, 10);
      userAttrs.password = hs
      //delete userAttrs.id;
      await prisma.user.upsert({
        where: {
          id: user.id
        },
        create: userAttrs,
        update: userAttrs
      });
      await prisma.$queryRaw`SELECT nextval('users_id_seq');`;
    } catch (error) {
      console.log(user)
      console.log(error)
    }

  }


  //DATA STORIES

  for await (const item of stories) {
    const itemAttrs = cloneDeep(item);
    //delete itemAttrs.id;
    await prisma.story.upsert({
      where: {
        id: item.id
      },
      create: itemAttrs,
      update: itemAttrs
    });
    await prisma.$queryRaw`SELECT nextval('stories_id_seq');`;
  }





}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
  });

//npx prisma migrate dev --name init && npx prisma db pull && npx prisma generate && npx prisma db seed