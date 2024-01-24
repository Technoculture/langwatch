import { OrganizationUserRole, TeamUserRole } from "@prisma/client";
import { prisma } from "../server/db";

export async function getTestUser() {
  // Ensure a user exists
  let user = await prisma.user.findUnique({
    where: {
      email: "test-user@example.com",
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test-user@example.com",
      },
    });
  }

  // Ensure an organization exists
  let organization = await prisma.organization.findUnique({
    where: {
      slug: "test-organization",
    },
  });
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Test Organization",
        slug: "test-organization",
      },
    });
  }

  // Ensure a team exists
  let team = await prisma.team.findUnique({
    where: {
      slug: "test-team",
    },
  });
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: "Test Team",
        slug: "test-team",
        organizationId: organization.id,
      },
    });
  }

  // Ensure a project with "test-project-id" exists
  const projectExists = await prisma.project.findUnique({
    where: {
      id: "test-project-id",
    },
  });
  if (!projectExists) {
    await prisma.project.create({
      data: {
        id: "test-project-id",
        name: "Test Project",
        slug: "test-project",
        apiKey: "test-api-key",
        teamId: team.id,
        language: "en",
        framework: "test-framework",
      },
    });
  }

  // Ensure the user is a member of the team
  const teamUserExists = await prisma.teamUser.findUnique({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId: team.id,
      },
    },
  });
  if (!teamUserExists) {
    await prisma.teamUser.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: TeamUserRole.MEMBER,
      },
    });
  }
  // Ensure the user is a member of the organization
  const orgUserExists = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
  });
  if (!orgUserExists) {
    await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: OrganizationUserRole.MEMBER,
      },
    });
  }

  return user;
}
