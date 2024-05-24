import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TriggerAction } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { nanoid } from "nanoid";
import { TeamRoleGroup, checkUserPermissionForProject } from "../permission";

export const triggerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
        action: z.nativeEnum(TriggerAction),
        filters: z.any(),
        organizationId: z.string(),
        actionParams: z.object({
          members: z.string().array(),
        }),
      })
    )
    .use(checkUserPermissionForProject(TeamRoleGroup.TRIGGERS_MANAGE))
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
      const organizationUsers = await ctx.prisma.organizationUser.findMany({
        where: {
          organizationId: input.organizationId,
        },
        include: {
          user: true,
        },
      });

      const organizationUserEmails = organizationUsers.map(
        (user) => user.user.email
      );

      input.actionParams.members.map((email) => {
        if (!organizationUserEmails.includes(email)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Error with selected emails",
          });
        }
      });

      return ctx.prisma.trigger.create({
        data: {
          id: nanoid(),
          name: input.name,
          action: input.action,
          actionParams: input.actionParams,
          filters: JSON.stringify(input.filters),
          projectId: input.projectId,
          lastRunAt: new Date().getTime(),
        },
      });
    }),
  deleteById: protectedProcedure
    .input(z.object({ projectId: z.string(), triggerId: z.string() }))
    .use(checkUserPermissionForProject(TeamRoleGroup.TRIGGERS_MANAGE))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.trigger.delete({
        where: {
          id: input.triggerId,
        },
      });

      return { success: true };
    }),
  getTriggers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .use(checkUserPermissionForProject(TeamRoleGroup.TRIGGERS_MANAGE))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.trigger.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),
  toggleTrigger: protectedProcedure
    .input(
      z.object({
        triggerId: z.string(),
        active: z.boolean(),
        projectId: z.string(),
      })
    )
    .use(checkUserPermissionForProject(TeamRoleGroup.TRIGGERS_MANAGE))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.trigger.update({
        where: {
          id: input.triggerId,
          projectId: input.projectId,
        },
        data: {
          active: input.active,
          lastRunAt: new Date().getTime(),
        },
      });
    }),
});
