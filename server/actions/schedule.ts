'use server';

import { ScheduleAvailabilityTable, ScheduleTable } from '@/drizzle/schema';

import { BatchItem } from 'drizzle-orm/batch';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { scheduleFormSchema } from '@/schema/schedule';
import z from 'zod';

type ScheduleRow = typeof ScheduleTable.$inferSelect;
type AvailableRow = typeof ScheduleAvailabilityTable.$inferSelect;

export type FullSchedule = ScheduleRow & {
  availabilities: AvailableRow[];
};

export async function getSchedule(userId: string): Promise<FullSchedule> {
  // Query the ScheduleTable for the first record that matches the user's ID
  // Also eagerly load the related 'availabilities' data
  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId), // Match schedule where user ID equals the provided userId
    with: {
      availabilities: true, // Include all related availability records
    },
  });

  // Return the schedule if found, or null if it doesn't exist
  return schedule as FullSchedule;
}

// This server action saves the user's schedule and availabilities
export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>, // Accepts unvalidated form data
) {
  try {
    const { userId } = await auth(); // Get currently authenticated user's ID

    // Validate the incoming data against the schedule schema
    const { success, data } = scheduleFormSchema.safeParse(unsafeData);

    // If validation fails or no user is authenticated, throw an error
    if (!success || !userId) {
      throw new Error('Invalid schedule data or user not authenticated.');
    }

    // Destructure availabilities and the rest of the schedule data
    const { availabilities, ...scheduleData } = data;

    // Insert or update the user's schedule and return the schedule ID
    const [{ id: scheduleId }] = await db
      .insert(ScheduleTable)
      .values({ ...scheduleData, clerkUserId: userId }) // Associate schedule with the current user
      .onConflictDoUpdate({
        target: ScheduleTable.clerkUserId, // Update if a schedule for this user already exists
        set: scheduleData,
      })
      .returning({ id: ScheduleTable.id }); // Return the schedule ID for use in the next step

    // Initialize SQL statements for batch execution
    const statements: [BatchItem<'pg'>] = [
      // First, delete any existing availabilities for this schedule
      db
        .delete(ScheduleAvailabilityTable)
        .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId)),
    ];

    // If there are availabilities, prepare an insert operation for them
    if (availabilities.length > 0) {
      statements.push(
        db.insert(ScheduleAvailabilityTable).values(
          availabilities.map((availability) => ({
            ...availability,
            scheduleId, // Link availability to the saved schedule
          })),
        ),
      );
    }

    // Run all statements in a single transaction
    await db.batch(statements);
  } catch (error: any) {
    // Catch and throw an error with a readable message
    throw new Error(`Failed to save schedule: ${error.message || error}`);
  } finally {
    // Revalidate the /schedule path to update the cache and reflect the new data
    revalidatePath('/schedule');
  }
}
