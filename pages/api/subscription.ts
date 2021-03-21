import {
  IsNotEmpty,
  IsString,
  ValidateIf,
  IsArray,
  IsOptional,
} from 'class-validator';
import { NextApiHandler } from 'next';
import { prisma } from '../../utils/api/prisma';
import withUser from '../../utils/api/withUser';
import withValidatedBody from '../../utils/api/withValidatedBody';
import sendFBMessage from '../../utils/api/notifyer';
import { gqlClient } from '../../utils/courseAPIClient';

class SubscriptionBody {
  @ValidateIf((o) => o.sectionHash === undefined)
  @IsString()
  @IsNotEmpty()
  courseHash?: string;

  @ValidateIf((o) => o.sectionHash === undefined && o.courseHash)
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  sectionHashes?: string[];

  @ValidateIf((o) => o.courseHash === undefined)
  @IsString()
  @IsNotEmpty()
  sectionHash?: string;
}

export class PostSubscriptionBody extends SubscriptionBody {}
export class DeleteSubscriptionBody extends SubscriptionBody {}

export default async function handler(req, res): Promise<void> {
  if (req.method === 'POST') {
    await post(req, res);
  } else if (req.method === 'DELETE') {
    await del(req, res);
  } else {
    res.status(404).end();
  }
}

/**
 * ========================= POST /api/subscription =======================
 * subscribe to course or section
 */

const post: NextApiHandler = withUser((userId, user) =>
  withValidatedBody(
    PostSubscriptionBody,
    (validatedBody) => async (req, res) => {
      if (!user) {
        res.status(401).end();
        return;
      }
      const { courseHash, sectionHash } = validatedBody;

      if (courseHash) {
        await prisma.followedCourse.upsert({
          create: { courseHash, user: { connect: { id: userId } } },
          update: {},
          where: { userId_courseHash: { courseHash, userId } },
        });

        const courseInfo = await gqlClient.getCourseInfoByHash({
          hash: courseHash,
        });

        sendFBMessage(
          user.fbMessengerId,
          `Successfully subscribed to notifications for course ${courseInfo.classByHash.subject} ${courseInfo.classByHash.classId}`
        );
      }

      if (sectionHash) {
        await prisma.followedSection.upsert({
          create: { sectionHash, user: { connect: { id: userId } } },
          update: {},
          where: { userId_sectionHash: { sectionHash, userId } },
        });

        const sectionInfo = await gqlClient.getSectionInfoByHash({
          hash: sectionHash,
        });

        sendFBMessage(
          user.fbMessengerId,
          `Successfully subscribed to notifications for ${sectionInfo.sectionByHash.subject} ${sectionInfo.sectionByHash.classId}, section ${sectionInfo.sectionByHash.crn}`
        );
      }
      res.status(201).end();
    }
  )
);

/**
 * ========================= DELETE /api/subscription =======================
 * unsubscribe to course or section
 */
const del: NextApiHandler = withUser((userId, user) =>
  withValidatedBody(
    DeleteSubscriptionBody,
    (validatedBody) => async (req, res) => {
      if (!user) {
        res.status(401).end();
        return;
      }
      const body = validatedBody;

      if (body.courseHash) {
        // delete many allows us to continue if there is nothing to delete.
        await prisma.followedCourse.deleteMany({
          where: {
            userId: userId,
            courseHash: body.courseHash,
          },
        });

        for (const sectionHash of body.sectionHashes) {
          await prisma.followedSection.deleteMany({
            where: {
              userId: userId,
              sectionHash: sectionHash,
            },
          });
        }

        const courseInfo = await gqlClient.getCourseInfoByHash({
          hash: body.courseHash,
        });

        sendFBMessage(
          user.fbMessengerId,
          `Successfully unsubscribed from notifications for course ${courseInfo.classByHash.subject} ${courseInfo.classByHash.classId}`
        );
      }

      if (body.sectionHash) {
        await prisma.followedSection.deleteMany({
          where: {
            userId: userId,
            sectionHash: body.sectionHash,
          },
        });

        const sectionInfo = await gqlClient.getSectionInfoByHash({
          hash: body.sectionHash,
        });

        sendFBMessage(
          user.fbMessengerId,
          `Successfully unsubscribed from notifications for ${sectionInfo.sectionByHash.subject} ${sectionInfo.sectionByHash.classId}, section ${sectionInfo.sectionByHash.crn} `
        );
      }
      res.status(200).end();
    }
  )
);
